import { z } from 'zod'

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(255, 'Tiêu đề không được quá 255 ký tự'),
  content: z
    .string()
    .min(1, 'Nội dung không được để trống')
    .max(10000, 'Nội dung không được quá 10000 ký tự'),
  isAnonymous: z.boolean().default(false),
})

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Nội dung không được để trống')
    .max(2000, 'Nội dung không được quá 2000 ký tự'),
})

export type CreatePostFormData = z.infer<typeof createPostSchema>
export type CreateCommentFormData = z.infer<typeof createCommentSchema>
