import type { Response } from 'express';
import { TestTemplateService } from '../services/test-template.service.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { success } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export function testTemplateController(service: TestTemplateService) {
  return {
    list: asyncHandler(async (_req: AuthRequest, res: Response) => {
      const templates = await service.list();
      res.json(success(templates));
    }),

    getById: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const template = await service.getById(id);
      res.json(success(template));
    }),

    create: asyncHandler(async (req: AuthRequest, res: Response) => {
      const { title, description, options } = req.body;
      const questions = options?.questions || [];
      const template = await service.create(req.userId!, { title, description, questions });
      res.status(201).json(success(template));
    }),

    update: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const { title, description, options } = req.body;
      const questions = options?.questions;
      const template = await service.update(id, req.userId!, req.userRole!, { title, description, questions });
      res.json(success(template));
    }),

    delete: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      await service.delete(id, req.userId!, req.userRole!);
      res.json(success({ message: 'Đã xóa bài kiểm tra' }));
    }),
  };
}
