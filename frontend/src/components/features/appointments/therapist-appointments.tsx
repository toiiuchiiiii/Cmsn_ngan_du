import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/appointment-schemas'
import type { Appointment } from '@/types'

export function TherapistAppointments() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', 'therapist'],
    queryFn: async () => {
      const res = await api.get('appointments/therapist').json<{ success: boolean; data: Appointment[] }>()
      return res.data ?? []
    },
    refetchInterval: 10000,
  })

  const confirmMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`appointments/${id}/status`, { json: { status: 'confirmed' } })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments', 'therapist'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`appointments/${id}/status`, { json: { status: 'cancelled', cancelReason: 'Tư vấn viên từ chối' } })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments', 'therapist'] }),
  })

  const appointments = data ?? []
  const pending = appointments.filter(a => a.status === 'pending')
  const confirmed = appointments.filter(a => a.status === 'confirmed')
  const completed = appointments.filter(a => a.status === 'completed')

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-fg-primary">Buổi tư vấn</h1>
        <p className="text-fg-secondary text-sm mt-1">Quản lý các buổi tư vấn được phân công</p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-hover rounded-xl animate-pulse" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-fg-tertiary text-sm">Chưa có buổi tư vấn nào.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-fg-secondary mb-3">Chờ xác nhận ({pending.length})</h2>
              <div className="space-y-2">
                {pending.map(a => (
                  <div key={a.id} className="rounded-xl bg-surface border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-fg-primary">
                          {new Date(a.date_time).toLocaleString('vi-VN')}
                        </p>
                        {a.notes && <p className="text-xs text-fg-tertiary mt-1">{a.notes}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => confirmMutation.mutate(a.id)} disabled={confirmMutation.isPending}
                          className="rounded-full bg-accent-sage text-white px-4 py-1.5 text-xs font-medium hover:bg-accent-sage/90 transition-colors disabled:opacity-50">
                          Đồng ý
                        </button>
                        <button type="button" onClick={() => cancelMutation.mutate(a.id)} disabled={cancelMutation.isPending}
                          className="rounded-full border border-crisis/30 px-4 py-1.5 text-xs text-crisis hover:bg-crisis-surface transition-colors disabled:opacity-50">
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {confirmed.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-fg-secondary mb-3">Sắp diễn ra ({confirmed.length})</h2>
              <div className="space-y-2">
                {confirmed.map(a => (
                  <div key={a.id} className="rounded-xl bg-surface border border-border p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS.confirmed.bg} ${STATUS_COLORS.confirmed.text}`}>
                        {STATUS_LABELS.confirmed}
                      </span>
                    </div>
                    <p className="text-sm text-fg-primary">{new Date(a.date_time).toLocaleString('vi-VN')}</p>
                    {a.notes && <p className="text-xs text-fg-tertiary mt-1">{a.notes}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-fg-secondary mb-3">Đã hoàn thành ({completed.length})</h2>
              <div className="space-y-2">
                {completed.map(a => (
                  <div key={a.id} className="rounded-xl bg-surface border border-border p-4 opacity-60">
                    <p className="text-sm text-fg-primary">{new Date(a.date_time).toLocaleString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
