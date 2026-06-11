import type { Response } from 'express';
import { DiaryService } from '../services/diary.service.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { success, paginated } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import type { DiaryEntry } from '../db/schema/diary-entries.js';

function splitTags(entry: DiaryEntry): Omit<DiaryEntry, 'tags'> & { tags: string[] } {
  return {
    ...entry,
    tags: entry.tags?.split(',').filter(Boolean) ?? [],
  };
}

export function diaryController(diaryService: DiaryService) {
  return {
    list: asyncHandler(async (req: AuthRequest, res: Response) => {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const { entries, total } = await diaryService.getEntries(req.userId!, page, limit);
      const mapped = entries.map(splitTags);
      res.json(paginated(mapped, total, page, limit));
    }),

    getById: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const entry = await diaryService.getEntry(id, req.userId!);
      res.json(success(splitTags(entry as DiaryEntry)));
    }),

    create: asyncHandler(async (req: AuthRequest, res: Response) => {
      const { content, mood, tags } = req.body;
      const entry = await diaryService.createEntry(req.userId!, { content, mood, tags });
      res.status(201).json(success(splitTags(entry as DiaryEntry)));
    }),

    update: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const { content, mood, tags } = req.body;
      const entry = await diaryService.updateEntry(id, req.userId!, { content, mood, tags });
      res.json(success(splitTags(entry as DiaryEntry)));
    }),

    delete: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      await diaryService.deleteEntry(id, req.userId!);
      res.json(success({ message: 'Xoá nhật ký thành công' }));
    }),
  };
}
