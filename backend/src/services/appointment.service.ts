import { AppointmentRepository } from '../repositories/appointment.repository.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [],
  completed: [],
};

export class AppointmentService {
  constructor(private appointmentRepo: AppointmentRepository) {}

  async getEntries(userId: number, page: number, limit: number) {
    return this.appointmentRepo.findByUserId(userId, page, limit);
  }

  async getEntry(id: number, userId: number) {
    const appointment = await this.appointmentRepo.findById(id);
    if (!appointment) {
      throw new NotFoundError('lịch hẹn');
    }
    if (appointment.userId !== userId) {
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

    const conflict = await this.appointmentRepo.findConflicting(
      appointmentDate,
      userId
    );
    if (conflict) {
      throw new ConflictError('Bạn đã có lịch hẹn vào khung giờ này');
    }

    const appointment = await this.appointmentRepo.create({
      userId,
      date: appointmentDate,
      notes: data.notes,
    });

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
    if (!appointment) {
      throw new NotFoundError('lịch hẹn');
    }

    const isOwner = appointment.userId === userId;
    const isTherapist = appointment.therapistId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isTherapist && !isAdmin) {
      throw new ForbiddenError('Bạn không có quyền cập nhật lịch hẹn này');
    }

    const currentStatus = appointment.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(data.status)) {
      throw new ConflictError(
        `Không thể chuyển trạng thái từ "${currentStatus}" sang "${data.status}"`
      );
    }

    if (data.status === 'cancelled' && isOwner && !data.cancelReason) {
      const updated = await this.appointmentRepo.update(id, {
        status: data.status,
        cancelReason: data.cancelReason,
      });
      return updated!;
    }

    const updated = await this.appointmentRepo.update(id, {
      status: data.status,
      ...(data.cancelReason ? { cancelReason: data.cancelReason } : {}),
    });

    logger.info(
      { appointmentId: id, userId, newStatus: data.status },
      'Appointment status updated'
    );
    return updated!;
  }

  async cancelEntry(id: number, userId: number, userRole: string) {
    const appointment = await this.appointmentRepo.findById(id);
    if (!appointment) {
      throw new NotFoundError('lịch hẹn');
    }

    const isOwner = appointment.userId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Bạn không có quyền huỷ lịch hẹn này');
    }

    await this.appointmentRepo.update(id, {
      status: 'cancelled',
      cancelReason: 'Huỷ bởi người dùng',
    });

    logger.info({ appointmentId: id, userId }, 'Appointment cancelled');
  }
}
