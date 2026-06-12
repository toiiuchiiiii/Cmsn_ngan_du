import { pgTable, serial, integer, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message'),
  relatedId: integer('related_id'),
  isRead: boolean('is_read').notNull().$default(() => false),
  createdAt: timestamp('created_at').notNull().$default(() => new Date()),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
