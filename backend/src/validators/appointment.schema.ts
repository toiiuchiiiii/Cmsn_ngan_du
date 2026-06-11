import { z } from 'zod';

export const createAppointmentSchema = z.object({
  date: z.string().datetime({ message: 'Ngày giờ không hợp lệ' }),
  notes: z.string().max(1000, 'Ghi chú tối đa 1000 ký tự').optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed'], {
    message: 'Trạng thái không hợp lệ',
  }),
  cancelReason: z.string().max(500, 'Lý do huỷ tối đa 500 ký tự').optional(),
});
