import { z } from 'zod';

export const createConversationSchema = z.object({
  contactId: z.number({ message: 'ID người dùng không hợp lệ' }).int().positive(),
});

export const sendMessageSchema = z.object({
  text: z.string().min(1, 'Tin nhắn không được để trống').max(5000, 'Tin nhắn tối đa 5000 ký tự'),
});

export const markReadSchema = z.object({
  messageIds: z.array(z.number().int().positive()).min(1, 'Danh sách tin nhắn không được để trống'),
});
