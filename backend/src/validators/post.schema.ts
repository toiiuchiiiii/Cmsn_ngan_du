import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  content: z.string().min(1, 'Nội dung không được để trống').max(10000, 'Nội dung tối đa 10000 ký tự'),
  isAnonymous: z.boolean().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự').optional(),
  content: z.string().min(1, 'Nội dung không được để trống').max(10000, 'Nội dung tối đa 10000 ký tự').optional(),
  isAnonymous: z.boolean().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Nội dung không được để trống').max(5000, 'Nội dung tối đa 5000 ký tự'),
});
