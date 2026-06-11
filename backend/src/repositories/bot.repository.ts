import { eq, like } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
  botReplies,
  chatFeedback,
  type BotReply,
  type NewBotReply,
  type NewChatFeedback,
} from '../db/schema/bot-replies.js';

export class BotReplyRepository {
  async findAll(): Promise<BotReply[]> {
    return db.select().from(botReplies).orderBy(botReplies.createdAt);
  }

  async findByKeyword(keyword: string): Promise<BotReply[]> {
    return db
      .select()
      .from(botReplies)
      .where(like(botReplies.keywords, `%${keyword}%`))
      .orderBy(botReplies.createdAt);
  }

  async create(data: NewBotReply): Promise<BotReply> {
    const result = await db.insert(botReplies).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewBotReply>): Promise<BotReply | undefined> {
    const result = await db
      .update(botReplies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(botReplies.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<BotReply | undefined> {
    const result = await db.delete(botReplies).where(eq(botReplies.id, id)).returning();
    return result[0];
  }
}

export class ChatFeedbackRepository {
  async create(data: NewChatFeedback): Promise<{ id: number }> {
    const result = await db
      .insert(chatFeedback)
      .values(data)
      .returning({ id: chatFeedback.id });
    return result[0];
  }
}
