import { z } from 'zod';

const moodValues = ['happy', 'sad', 'anxious', 'calm', 'stressed', 'angry'] as const;

export const createDiarySchema = z.object({
  content: z.string().min(1, 'Nội dung không được để trống').max(10000, 'Nội dung tối đa 10000 ký tự'),
  mood: z.enum(moodValues, { message: 'Tâm trạng không hợp lệ' }),
  tags: z.array(z.string()).optional(),
});

export const updateDiarySchema = z.object({
  content: z.string().min(1, 'Nội dung không được để trống').max(10000, 'Nội dung tối đa 10000 ký tự').optional(),
  mood: z.enum(moodValues, { message: 'Tâm trạng không hợp lệ' }).optional(),
  tags: z.array(z.string()).optional(),
});
