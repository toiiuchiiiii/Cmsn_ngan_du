import { pgTable, serial, varchar, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const testTemplates = pgTable('test_templates', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().$default(() => new Date()),
  updatedAt: timestamp('updated_at').notNull().$default(() => new Date()),
});

export const testQuestions = pgTable('test_questions', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').notNull().references(() => testTemplates.id),
  questionText: text('question_text').notNull(),
  options: jsonb('options').notNull().$default(() => []),
  orderIndex: integer('order_index').notNull().$default(() => 0),
  createdAt: timestamp('created_at').notNull().$default(() => new Date()),
});

export type TestTemplate = typeof testTemplates.$inferSelect;
export type NewTestTemplate = typeof testTemplates.$inferInsert;
export type TestQuestion = typeof testQuestions.$inferSelect;
export type NewTestQuestion = typeof testQuestions.$inferInsert;
