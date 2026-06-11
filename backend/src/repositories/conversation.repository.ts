import { eq, desc, and, inArray, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
  conversations,
  conversationParticipants,
  messages,
  type Conversation,
  type NewConversation,
  type ConversationParticipant,
  type NewConversationParticipant,
} from '../db/schema/conversations.js';

export class ConversationRepository {
  async create(data: NewConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(data).returning();
    return result[0];
  }

  async findById(id: number): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async findExistingPrivateConversation(userId: number, contactId: number): Promise<Conversation | undefined> {
    const userConvs = db.$with('user_convs').as(
      db
        .select({ conversationId: conversationParticipants.conversationId })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.userId, userId))
    );

    const result = await db
      .with(userConvs)
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .innerJoin(userConvs, eq(conversationParticipants.conversationId, sql`${userConvs}.conversation_id`))
      .where(eq(conversationParticipants.userId, contactId))
      .limit(1);

    if (result.length === 0) return undefined;
    return this.findById(result[0].conversationId);
  }

  async findByUserId(userId: number): Promise<{ conversation: Conversation; lastMessage: unknown; participantIds: number[] }[]> {
    const result = await db
      .select({
        conversation: conversations,
        lastMessage: messages,
        participantId: conversationParticipants.userId,
      })
      .from(conversations)
      .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
      .leftJoin(
        messages,
        sql`${messages.conversationId} = ${conversations.id} AND ${messages.createdAt} = (
          SELECT MAX(created_at) FROM ${messages} WHERE conversation_id = ${conversations.id}
        )`
      )
      .where(
        inArray(
          conversations.id,
          db
            .select({ id: conversationParticipants.conversationId })
            .from(conversationParticipants)
            .where(eq(conversationParticipants.userId, userId))
        )
      )
      .orderBy(desc(conversations.updatedAt));

    const grouped = new Map<number, { conversation: Conversation; lastMessage: unknown; participantIds: number[] }>();

    for (const row of result) {
      const existing = grouped.get(row.conversation.id);
      if (existing) {
        existing.participantIds.push(row.participantId);
      } else {
        grouped.set(row.conversation.id, {
          conversation: row.conversation,
          lastMessage: row.lastMessage,
          participantIds: [row.participantId],
        });
      }
    }

    return Array.from(grouped.values());
  }

  async updateTimestamp(id: number): Promise<void> {
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, id));
  }

  async addParticipant(data: NewConversationParticipant): Promise<ConversationParticipant> {
    const result = await db.insert(conversationParticipants).values(data).returning();
    return result[0];
  }

  async addParticipants(data: NewConversationParticipant[]): Promise<ConversationParticipant[]> {
    if (data.length === 0) return [];
    const result = await db.insert(conversationParticipants).values(data).returning();
    return result;
  }

  async findParticipants(conversationId: number): Promise<ConversationParticipant[]> {
    return db
      .select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversationId, conversationId));
  }

  async isParticipant(conversationId: number, userId: number): Promise<boolean> {
    const result = await db
      .select({ id: conversationParticipants.id })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);
    return result.length > 0;
  }

  async markAsRead(conversationId: number, userId: number, messageIds: number[]): Promise<void> {
    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      );

    if (messageIds.length > 0) {
      await db
        .update(messages)
        .set({ isRead: 1 })
        .where(
          and(
            eq(messages.conversationId, conversationId),
            inArray(messages.id, messageIds),
            sql`${messages.senderId} != ${userId}`
          )
        );
    }
  }
}
