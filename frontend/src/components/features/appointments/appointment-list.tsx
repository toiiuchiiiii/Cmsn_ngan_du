
import { AppointmentCard, AppointmentCardSkeleton } from './appointment-card'
import { useAppointments, useCancelAppointment } from '@/hooks/use-appointments'
import type { Appointment, AppointmentStatus } from '@/types'

const STATUS_ORDER: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

const SECTION_TITLES: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Sắp diễn ra',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã huỷ',
}

function groupByStatus(appointments: Appointment[]): Map<string, Appointment[]> {
  const groups = new Map<string, Appointment[]>()
  for (const status of STATUS_ORDER) {
    groups.set(status, [])
  }
  for (const apt of appointments) {
    const existing = groups.get(apt.status) ?? []
    existing.push(apt)
    groups.set(apt.status, existing)
  }
  return groups
}

export function AppointmentList() {
  const { data, isLoading, isError, error, refetch } = useAppointments()
  const cancelMutation = useCancelAppointment()


  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" role="status">
        <AppointmentCardSkeleton />
        <AppointmentCardSkeleton />
        <AppointmentCardSkeleton />
        <span className="sr-only">Đang tải lịch hẹn...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className="rounded-xl bg-crisis-surface border border-crisis/20 px-5 py-6 text-center"
        role="alert"
      >
        <p className="text-sm text-crisis mb-3">
          {error instanceof Error ? error.message : 'Không thể tải lịch hẹn. Vui lòng thử lại.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full bg-accent-sage text-white text-sm font-medium py-2 px-5 transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const appointments = data?.appointments ?? []

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 text-fg-tertiary">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect x="8" y="8" width="48" height="48" rx="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M20 8v6M44 8v6M8 22h48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="44" cy="46" r="10" fill="currentColor" opacity="0.1" />
            <path d="M44 42v8M40 46h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-fg-secondary text-lg mb-1">Bạn chưa có lịch hẹn nào</p>
        <p className="text-fg-tertiary text-sm mb-6">Hãy đặt lịch hẹn đầu tiên để bắt đầu hành trình chăm sóc sức khoẻ tinh thần</p>
        <button
          type="button"
          onClick={() => {
            document.getElementById('tab-dat-lich')?.click()
          }}
          className="rounded-full bg-accent-sage text-white font-medium py-2.5 px-6 transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
        >
          Đặt lịch ngay
        </button>
      </div>
    )
  }

  const groups = groupByStatus(appointments)

  return (
    <div className="space-y-6">
      {STATUS_ORDER.map((status) => {
        const group = groups.get(status) ?? []
        if (group.length === 0) return null

        return (
          <section key={status} aria-labelledby={`section-${status}`}>
            <div className="flex items-center gap-2 mb-3">
              <h3 id={`section-${status}`} className="text-sm font-medium text-fg-secondary">
                {SECTION_TITLES[status]}
              </h3>
              <span className="text-xs text-fg-tertiary">({group.length})</span>
            </div>
            <div className="space-y-2">
              {group.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  isCancelling={cancelMutation.isPending}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
