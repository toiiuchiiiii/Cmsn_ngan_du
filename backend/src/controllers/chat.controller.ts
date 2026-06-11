import type { Response } from 'express';
import { ChatService } from '../services/chat.service.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { success } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export function chatController(chatService: ChatService) {
  return {
    convList: asyncHandler(async (req: AuthRequest, res: Response) => {
      const conversations = await chatService.getConversations(req.userId!);
      res.json(success(conversations));
    }),

    convDetail: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const detail = await chatService.getConversationDetail(id, req.userId!);
      res.json(success(detail));
    }),

    createConv: asyncHandler(async (req: AuthRequest, res: Response) => {
      const { contactId } = req.body;
      const conversation = await chatService.createConversation(req.userId!, contactId);
      res.status(201).json(success(conversation));
    }),

    messageList: asyncHandler(async (req: AuthRequest, res: Response) => {
      const conversationId = parseInt(req.params.id as string, 10);
      const cursor = req.query.cursor ? parseInt(req.query.cursor as string, 10) : undefined;
      const result = await chatService.getMessages(conversationId, req.userId!, cursor);
      res.json(success(result.entries, { hasMore: result.hasMore }));
    }),

    sendMessage: asyncHandler(async (req: AuthRequest, res: Response) => {
      const conversationId = parseInt(req.params.id as string, 10);
      const { text } = req.body;
      const message = await chatService.sendMessage(conversationId, req.userId!, text);
      res.status(201).json(success(message));
    }),

    markRead: asyncHandler(async (req: AuthRequest, res: Response) => {
      const conversationId = parseInt(req.params.id as string, 10);
      const { messageIds } = req.body;
      await chatService.markAsRead(conversationId, req.userId!, messageIds);
      res.json(success({ message: 'Đã đánh dấu đã đọc' }));
    }),
  };
}
