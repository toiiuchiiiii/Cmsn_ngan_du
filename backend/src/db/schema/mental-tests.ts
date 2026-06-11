import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const mentalTests = pgTable('mental_tests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  result: varchar('result', { length: 100 }).notNull(),
  answers: text('answers').notNull(),
  testType: varchar('test_type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').notNull().$default(() => new Date()),
});

export type MentalTest = typeof mentalTests.$inferSelect;
export type NewMentalTest = typeof mentalTests.$inferInsert;
