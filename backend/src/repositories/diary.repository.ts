import { eq, desc, count } from 'drizzle-orm';
import { db } from '../config/database.js';
import { diaryEntries, type DiaryEntry, type NewDiaryEntry } from '../db/schema/diary-entries.js';

export class DiaryRepository {
  async findByUserId(userId: number, page: number, limit: number): Promise<{ entries: DiaryEntry[]; total: number }> {
    const offset = (page - 1) * limit;

    const [total] = await db.select({ total: count() }).from(diaryEntries).where(eq(diaryEntries.userId, userId));
    const entries = await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.createdAt))
      .limit(limit)
      .offset(offset);

    return { entries, total: total.total };
  }

  async findById(id: number): Promise<DiaryEntry | undefined> {
    const result = await db.select().from(diaryEntries).where(eq(diaryEntries.id, id)).limit(1);
    return result[0];
  }

  async create(data: NewDiaryEntry): Promise<DiaryEntry> {
    const result = await db.insert(diaryEntries).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<NewDiaryEntry>): Promise<DiaryEntry | undefined> {
    const result = await db
      .update(diaryEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(diaryEntries.id, id))
      .returning();
    return result[0];
  }

  async delete(id: number): Promise<void> {
    await db.delete(diaryEntries).where(eq(diaryEntries.id, id));
  }
}
