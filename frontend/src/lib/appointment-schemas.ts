import { z } from 'zod'

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
  completed: 'Đã hoàn thành',
}

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-accent-lavender-surface', text: 'text-accent-lavender' },
  confirmed: { bg: 'bg-accent-sage-surface', text: 'text-accent-sage' },
  cancelled: { bg: 'bg-accent-rose-surface', text: 'text-accent-rose' },
  completed: { bg: 'bg-surface-hover', text: 'text-fg-tertiary' },
}

export const createAppointmentSchema = z.object({
  date_time: z.string().min(1, 'Vui lòng chọn thời gian'),
  notes: z
    .string()
    .max(2000, 'Ghi chú không được quá 2000 ký tự')
    .optional()
    .or(z.literal('')),
})

export type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>
