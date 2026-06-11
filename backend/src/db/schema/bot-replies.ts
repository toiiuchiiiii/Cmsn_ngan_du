import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const botReplies = pgTable('bot_replies', {
  id: serial('id').primaryKey(),
  keywords: text('keywords').notNull(),
  reply: text('reply').notNull(),
  createdAt: timestamp('created_at').notNull().$default(() => new Date()),
  updatedAt: timestamp('updated_at').notNull().$default(() => new Date()),
});

export const chatFeedback = pgTable('chat_feedback', {
  id: serial('id').primaryKey(),
  messageText: text('message_text').notNull(),
  botReply: text('bot_reply').notNull(),
  helpful: integer('helpful').notNull().$default(() => 0),
  keywords: text('keywords'),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().$default(() => new Date()),
});

export type BotReply = typeof botReplies.$inferSelect;
export type NewBotReply = typeof botReplies.$inferInsert;
export type ChatFeedbackEntry = typeof chatFeedback.$inferSelect;
export type NewChatFeedback = typeof chatFeedback.$inferInsert;
