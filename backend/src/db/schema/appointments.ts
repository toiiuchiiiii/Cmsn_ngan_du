import { pgTable, serial, integer, timestamp, varchar, text } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  therapistId: integer('therapist_id').references(() => users.id),
  date: timestamp('date').notNull(),
  status: varchar('status', { length: 20 }).notNull().$default(() => 'pending'),
  notes: text('notes'),
  cancelReason: varchar('cancel_reason', { length: 500 }),
  createdAt: timestamp('created_at').notNull().$default(() => new Date()),
  updatedAt: timestamp('updated_at').notNull().$default(() => new Date()),
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
