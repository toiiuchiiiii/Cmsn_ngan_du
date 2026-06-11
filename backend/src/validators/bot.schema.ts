import { z } from 'zod';

export const botChatSchema = z.object({
  message: z.string().min(1, 'Tin nhắn không được để trống').max(2000, 'Tin nhắn tối đa 2000 ký tự'),
});

export const createBotReplySchema = z.object({
  keywords: z.string().min(1, 'Từ khóa không được để trống'),
  reply: z.string().min(1, 'Phản hồi không được để trống'),
});

export const updateBotReplySchema = z.object({
  keywords: z.string().min(1, 'Từ khóa không được để trống').optional(),
  reply: z.string().min(1, 'Phản hồi không được để trống').optional(),
});

export const botFeedbackSchema = z.object({
  messageText: z.string().min(1, 'Tin nhắn không được để trống'),
  botReply: z.string().min(1, 'Phản hồi không được để trống'),
  helpful: z.number().int().min(0).max(1),
});
