import type { Response } from 'express';
import { TestService } from '../services/test.service.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { success, paginated } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export function testController(testService: TestService) {
  return {
    list: asyncHandler(async (req: AuthRequest, res: Response) => {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const { entries, total } = await testService.getEntries(req.userId!, page, limit);
      res.json(paginated(entries, total, page, limit));
    }),

    getById: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const entry = await testService.getEntry(id, req.userId!);
      res.json(success(entry));
    }),

    create: asyncHandler(async (req: AuthRequest, res: Response) => {
      const { answers, testType } = req.body;
      const entry = await testService.createEntry(req.userId!, { answers, testType });
      res.status(201).json(success(entry));
    }),
  };
}
