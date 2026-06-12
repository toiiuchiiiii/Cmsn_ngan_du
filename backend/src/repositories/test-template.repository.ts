import { eq, asc, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { testTemplates, testQuestions, type TestTemplate, type NewTestTemplate, type TestQuestion, type NewTestQuestion } from '../db/schema/test-templates.js';

export class TestTemplateRepository {
  async findAll(): Promise<(TestTemplate & { questions: TestQuestion[] })[]> {
    const templates = await db.select().from(testTemplates).orderBy(desc(testTemplates.createdAt));
    const result: (TestTemplate & { questions: TestQuestion[] })[] = [];
    for (const t of templates) {
      const questions = await db.select().from(testQuestions).where(eq(testQuestions.templateId, t.id)).orderBy(asc(testQuestions.orderIndex));
      result.push({ ...t, questions });
    }
    return result;
  }

  async findById(id: number): Promise<(TestTemplate & { questions: TestQuestion[] }) | undefined> {
    const t = (await db.select().from(testTemplates).where(eq(testTemplates.id, id)).limit(1))[0];
    if (!t) return;
    const questions = await db.select().from(testQuestions).where(eq(testQuestions.templateId, id)).orderBy(asc(testQuestions.orderIndex));
    return { ...t, questions };
  }

  async create(data: NewTestTemplate, questions: { questionText: string; options: { label: string; value: number }[]; orderIndex: number }[]) {
    const [template] = await db.insert(testTemplates).values(data).returning();
    if (questions.length > 0) {
      await db.insert(testQuestions).values(
        questions.map(q => ({ ...q, templateId: template.id }))
      ).returning();
    }
    return this.findById(template.id);
  }

  async update(id: number, data: Partial<NewTestTemplate>, questions?: { questionText: string; options: { label: string; value: number }[]; orderIndex: number }[]) {
    const [template] = await db.update(testTemplates).set({ ...data, updatedAt: new Date() }).where(eq(testTemplates.id, id)).returning();
    if (questions) {
      await db.delete(testQuestions).where(eq(testQuestions.templateId, id));
      if (questions.length > 0) {
        await db.insert(testQuestions).values(
          questions.map(q => ({ ...q, templateId: id }))
        ).returning();
      }
    }
    return this.findById(template.id);
  }

  async delete(id: number) {
    await db.delete(testQuestions).where(eq(testQuestions.templateId, id));
    await db.delete(testTemplates).where(eq(testTemplates.id, id));
  }
}
