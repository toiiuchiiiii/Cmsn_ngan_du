import { z } from 'zod'

export const MOODS = ['happy', 'sad', 'anxious', 'calm', 'stressed', 'angry'] as const
export type Mood = typeof MOODS[number]

export const MOOD_LABELS: Record<Mood, string> = {
  happy: 'Vui',
  sad: 'Buồn',
  anxious: 'Lo lắng',
  calm: 'Bình tĩnh',
  stressed: 'Căng thẳng',
  angry: 'Tức giận',
}

export const MOOD_EMOJIS: Record<Mood, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  calm: '😌',
  stressed: '😫',
  angry: '😠',
}

export const createEntrySchema = z.object({
  content: z
    .string()
    .min(1, 'Nội dung không được để trống')
    .max(5000, 'Nội dung không được quá 5000 ký tự'),
  mood: z.enum(MOODS, 'Vui lòng chọn tâm trạng'),
  tags: z.array(z.string()).default([]),
})

export type CreateEntryFormData = z.infer<typeof createEntrySchema>
