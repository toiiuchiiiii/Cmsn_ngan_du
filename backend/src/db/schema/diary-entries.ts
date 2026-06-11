import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const diaryEntries = pgTable('diary_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  mood: varchar('mood', { length: 20 }).notNull(),
  tags: text('tags'),
  createdAt: timestamp('created_at').notNull().$default(() => new Date()),
  updatedAt: timestamp('updated_at').notNull().$default(() => new Date()),
});

export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type NewDiaryEntry = typeof diaryEntries.$inferInsert;
