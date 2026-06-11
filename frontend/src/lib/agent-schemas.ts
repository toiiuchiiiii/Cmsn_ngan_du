import { z } from 'zod'

export const botChatSchema = z.object({
  message: z.string().min(1).max(2000),
})

export const botFeedbackSchema = z.object({
  messageText: z.string(),
  botReply: z.string(),
  helpful: z.union([z.literal(0), z.literal(1)]),
})

export type BotChatFormData = z.infer<typeof botChatSchema>
export type BotFeedbackFormData = z.infer<typeof botFeedbackSchema>
