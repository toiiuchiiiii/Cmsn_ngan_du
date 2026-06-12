import { z } from 'zod';

export const questionSchema = z.object({
  questionText: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  options: z.array(z.object({
    label: z.string().min(1),
    value: z.number().int(),
  })).min(2, 'Cần ít nhất 2 lựa chọn'),
  orderIndex: z.number().int().min(0),
});

export const createTestTemplateSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(255),
  description: z.string().optional(),
  options: z.object({
    questions: z.array(questionSchema).min(1, 'Cần ít nhất 1 câu hỏi'),
  }),
});

export const updateTestTemplateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  options: z.object({
    questions: z.array(questionSchema).min(1),
  }).optional(),
});
