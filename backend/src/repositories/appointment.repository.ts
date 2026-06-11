import { eq, desc, count, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
  appointments,
  type Appointment,
  type NewAppointment,
} from '../db/schema/appointments.js';

export class AppointmentRepository {
  async findByUserId(
    userId: number,
    page: number,
    limit: number
  ): Promise<{ entries: Appointment[]; total: number }> {
    const offset = (page - 1) * limit;

    const [total] = await db
      .select({ total: count() })
      .from(appointments)
      .where(eq(appointments.userId, userId));

    const entries = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.date))
      .limit(limit)
      .offset(offset);

    return { entries, total: total.total };
  }

  async findByTherapistId(
    therapistId: number,
    page: number,
    limit: number
  ): Promise<{ entries: Appointment[]; total: number }> {
    const offset = (page - 1) * limit;

    const [total] = await db
      .select({ total: count() })
      .from(appointments)
      .where(eq(appointments.therapistId, therapistId));

    const entries = await db
      .select()
      .from(appointments)
      .where(eq(appointments.therapistId, therapistId))
      .orderBy(desc(appointments.date))
      .limit(limit)
      .offset(offset);

    return { entries, total: total.total };
  }

  async findById(id: number): Promise<Appointment | undefined> {
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);
    return result[0];
  }

  async findConflicting(
    date: Date,
    userId: number
  ): Promise<Appointment | undefined> {
    const result = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, userId),
          eq(appointments.date, date),
          eq(appointments.status, 'pending')
        )
      )
      .limit(1);
    return result[0];
  }

  async create(data: NewAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(data).returning();
    return result[0];
  }

  async update(
    id: number,
    data: Partial<NewAppointment>
  ): Promise<Appointment | undefined> {
    const result = await db
      .update(appointments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }
}
