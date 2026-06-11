import { DiaryRepository } from '../repositories/diary.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export class DiaryService {
  constructor(private diaryRepo: DiaryRepository) {}

  async getEntries(userId: number, page: number, limit: number) {
    const { entries, total } = await this.diaryRepo.findByUserId(userId, page, limit);
    return { entries, total };
  }

  async getEntry(id: number, userId: number) {
    const entry = await this.diaryRepo.findById(id);
    if (!entry) {
      throw new NotFoundError('nhật ký');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền xem nhật ký này');
    }
    return entry;
  }

  async createEntry(userId: number, data: { content: string; mood: string; tags?: string[] }) {
    const tags = data.tags?.join(',') ?? null;
    const entry = await this.diaryRepo.create({
      userId,
      content: data.content,
      mood: data.mood,
      tags,
    });

    logger.info({ diaryEntryId: entry.id, userId }, 'Diary entry created');
    return entry;
  }

  async updateEntry(id: number, userId: number, data: Partial<{ content: string; mood: string; tags?: string[] }>) {
    const entry = await this.diaryRepo.findById(id);
    if (!entry) {
      throw new NotFoundError('nhật ký');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền sửa nhật ký này');
    }

    const updateData = { ...data, tags: data.tags ? data.tags.join(',') : data.tags };
    const updated = await this.diaryRepo.update(id, updateData);
    return updated!;
  }

  async deleteEntry(id: number, userId: number) {
    const entry = await this.diaryRepo.findById(id);
    if (!entry) {
      throw new NotFoundError('nhật ký');
    }
    if (entry.userId !== userId) {
      throw new ForbiddenError('Bạn không có quyền xoá nhật ký này');
    }

    await this.diaryRepo.delete(id);
    logger.info({ diaryEntryId: id, userId }, 'Diary entry deleted');
  }
}
