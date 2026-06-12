import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const roleRequests = pgTable('role_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  requestedRole: varchar('requested_role', { length: 20 }).notNull().$default(() => 'therapist'),
  reason: text('reason'),
  status: varchar('status', { length: 20 }).notNull().$default(() => 'pending'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().$default(() => new Date()),
  updatedAt: timestamp('updated_at').notNull().$default(() => new Date()),
});

export type RoleRequest = typeof roleRequests.$inferSelect;
export type NewRoleRequest = typeof roleRequests.$inferInsert;
