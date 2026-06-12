import { eq, desc, and, sql, gt } from 'drizzle-orm';
import { db } from '../config/database.js';
import { AppointmentRepository } from '../repositories/appointment.repository.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import { NotificationService } from './notification.service.js';
import { users } from '../db/schema/users.js';
import { logger } from '../utils/logger.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [],
  completed: [],
};

const notifService = new NotificationService();

export class AppointmentService {
  constructor(private appointmentRepo: AppointmentRepository) {}

  async getEntries(userId: number, page: number, limit: number) {
    return this.appointmentRepo.findByUserId(userId, page, limit);
  }

  async getTherapistEntries(therapistId: number, page: number, limit: number) {
    return this.appointmentRepo.findByTherapistId(therapistId, page, limit);
  }

  async getEntry(id: number, userId: number) {
    const appointment = await this.appointmentRepo.findById(id);
    if (!appointment) throw new NotFoundError('lịch hẹn');
    if (appointment.userId !== userId && appointment.therapistId !== userId) {
      throw new ForbiddenError('Bạn không có quyền xem lịch hẹn này');
    }
    return appointment;
  }

  async createEntry(userId: number, data: { date: string; notes?: string }) {
    const appointmentDate = new Date(data.date);
    const now = new Date();

    if (appointmentDate <= now) {
      throw new ConflictError('Không thể đặt lịch hẹn trong quá khứ');
    }

    const conflict = await this.appointmentRepo.findConflicting(appointmentDate, userId);
    if (conflict) throw new ConflictError('Bạn đã có lịch hẹn vào khung giờ này');

    // Auto-assign random active therapist (active within last 2 days)
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const activeTherapists = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(
        and(
          eq(users.role, 'therapist'),
          eq(users.isActive, true),
          gt(users.updatedAt, twoDaysAgo)
        )
      );

    let therapistId: number | null = null;
    let therapistName: string | undefined;
    if (activeTherapists.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeTherapists.length);
      therapistId = activeTherapists[randomIndex].id;
      therapistName = activeTherapists[randomIndex].name;
    }

    const appointment = await this.appointmentRepo.create({
      userId,
      therapistId,
      date: appointmentDate,
      notes: data.notes,
      status: 'pending',
    });

    // Notify therapist
    if (therapistId) {
      await notifService.create({
        userId: therapistId,
        type: 'appointment_assigned',
        title: 'Buổi tư vấn mới',
        message: `Bạn được phân công buổi tư vấn vào ${appointmentDate.toLocaleString('vi-VN')}`,
        relatedId: appointment.id,
      });
      logger.info({ appointmentId: appointment.id, therapistId }, 'Therapist assigned and notified');
    }

    logger.info({ appointmentId: appointment.id, userId }, 'Appointment created');
    return appointment;
  }

  async updateStatus(
    id: number,
    userId: number,
    userRole: string,
    data: { status: string; cancelReason?: string }
  ) {
    const appointment = await this.appointmentRepo.findById(id);
    if (!appointment) throw new NotFoundError('lịch hẹn');

    const isOwner = appointment.userId === userId;
    const isTherapist = appointment.therapistId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isTherapist && !isAdmin) {
      throw new ForbiddenError('Bạn không có quyền cập nhật lịch hẹn này');
    }

    const currentStatus = appointment.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(data.status)) {
      throw new ConflictError(`Không thể chuyển trạng thái từ "${currentStatus}" sang "${data.status}"`);
    }

    const updated = await this.appointmentRepo.update(id, {
      status: data.status,
      ...(data.cancelReason ? { cancelReason: data.cancelReason } : {}),
    });

    // Notify user when therapist confirms
    if (data.status === 'confirmed' && isTherapist) {
      await notifService.create({
        userId: appointment.userId,
        type: 'appointment_confirmed',
        title: 'Buổi tư vấn đã được xác nhận',
        message: `Tư vấn viên đã xác nhận buổi hẹn vào ${appointment.date.toLocaleString('vi-VN')}`,
        relatedId: appointment.id,
      });
    }

    logger.info({ appointmentId: id, userId, newStatus: data.status }, 'Appointment status updated');
    return updated!;
  }

  async cancelEntry(id: number, userId: number, userRole: string) {
    const appointment = await this.appointmentRepo.findById(id);
    if (!appointment) throw new NotFoundError('lịch hẹn');

    const isOwner = appointment.userId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) throw new ForbiddenError('Bạn không có quyền huỷ lịch hẹn này');

    await this.appointmentRepo.update(id, {
      status: 'cancelled',
      cancelReason: 'Huỷ bởi người dùng',
    });

    logger.info({ appointmentId: id, userId }, 'Appointment cancelled');
  }
}
