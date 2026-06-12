import type { Response } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { success } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

const service = new NotificationService();

export const notificationController = {
  list: asyncHandler(async (req: AuthRequest, res: Response) => {
    const notifs = await service.list(req.userId!);
    res.json(success(notifs));
  }),

  markRead: asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await service.markRead(id, req.userId!);
    res.json(success({ message: 'Đã đánh dấu đã đọc' }));
  }),

  markAllRead: asyncHandler(async (req: AuthRequest, res: Response) => {
    await service.markAllRead(req.userId!);
    res.json(success({ message: 'Đã đánh dấu tất cả đã đọc' }));
  }),

  unreadCount: asyncHandler(async (req: AuthRequest, res: Response) => {
    const count = await service.unreadCount(req.userId!);
    res.json(success({ count }));
  }),
};
