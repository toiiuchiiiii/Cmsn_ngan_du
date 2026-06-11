import { useState } from 'react'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/appointment-schemas'
import type { Appointment } from '@/types'

interface AppointmentCardProps {
  appointment: Appointment
  onCancel: (id: number) => void
  isCancelling?: boolean
}

export function AppointmentCard({ appointment, onCancel, isCancelling }: AppointmentCardProps) {
  const [confirming, setConfirming] = useState(false)
  const statusColor = STATUS_COLORS[appointment.status] ?? STATUS_COLORS.pending
  const date = new Date(appointment.date_time).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="rounded-xl bg-surface border border-border p-4 transition-colors hover:border-border-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
            >
              {STATUS_LABELS[appointment.status] ?? appointment.status}
            </span>
          </div>
          <time className="block text-sm text-fg-primary font-medium" dateTime={appointment.date_time}>
            {date}
          </time>
          <p className="text-sm text-fg-secondary">
            {appointment.therapist_name}
          </p>
          {appointment.notes && (
            <p className="text-xs text-fg-tertiary leading-relaxed">{appointment.notes}</p>
          )}
        </div>

        {appointment.status === 'pending' && (
          <div className="shrink-0">
            {confirming ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onCancel(appointment.id)}
                  disabled={isCancelling}
                  className="text-xs rounded-full bg-crisis text-white px-2.5 py-1 transition-colors hover:bg-crisis/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crisis"
                >
                  {isCancelling ? 'Đang huỷ...' : 'Xác nhận'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="text-xs rounded-full border border-border px-2.5 py-1 text-fg-secondary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
                >
                  Giữ lại
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-xs rounded-full border border-border px-3 py-1 text-fg-tertiary transition-colors hover:text-crisis hover:border-crisis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
              >
                Huỷ lịch
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export function AppointmentCardSkeleton() {
  return (
    <div className="rounded-xl bg-surface border border-border p-4" aria-busy="true">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-surface-hover rounded animate-pulse" />
        <div className="h-4 w-48 bg-surface-hover rounded animate-pulse" />
        <div className="h-3 w-32 bg-surface-hover rounded animate-pulse" />
      </div>
    </div>
  )
}
