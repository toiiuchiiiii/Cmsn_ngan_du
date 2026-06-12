import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Appointment } from '@/types'
import type { CreateAppointmentFormData } from '@/lib/appointment-schemas'

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await api.get('appointments').json<{ success: boolean; data: Appointment[] }>()
      return { appointments: res.data }
    },
    staleTime: 0,
    gcTime: 0,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAppointmentFormData) =>
      api.post('appointments', { json: { date: data.date_time, notes: data.notes || undefined } }).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useCancelAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`appointments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
