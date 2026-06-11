import { z } from 'zod'

export const sendMessageSchema = z.object({
  text: z
    .string()
    .min(1, 'Tin nhắn không được để trống')
    .max(5000, 'Tin nhắn không được quá 5000 ký tự'),
})

export const createConversationSchema = z.object({
  contact_id: z.number({ message: 'Vui lòng chọn người nhận' }),
})

export type SendMessageFormData = z.infer<typeof sendMessageSchema>
export type CreateConversationFormData = z.infer<typeof createConversationSchema>
