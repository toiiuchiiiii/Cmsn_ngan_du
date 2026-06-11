import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAppointmentSchema, type CreateAppointmentFormData } from '@/lib/appointment-schemas'

interface AppointmentBookProps {
  onSubmit: (data: CreateAppointmentFormData) => Promise<void>
  isLoading?: boolean
  isError?: boolean
  error?: Error | null
}

export function AppointmentBook({ onSubmit, isLoading, isError, error }: AppointmentBookProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: { date_time: '', notes: '' },
  })

  const handleFormSubmit = async (data: CreateAppointmentFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="appointment-date" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Chọn thời gian
        </label>
        <input
          id="appointment-date"
          type="datetime-local"
          aria-required="true"
          aria-invalid={!!errors.date_time}
          aria-describedby={errors.date_time ? 'date-time-error' : undefined}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors [color-scheme:light]"
          {...register('date_time')}
        />
        {errors.date_time && (
          <p id="date-time-error" className="mt-1 text-sm text-crisis" role="alert">
            {errors.date_time.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="appointment-notes" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Ghi chú <span className="text-fg-tertiary">(không bắt buộc)</span>
        </label>
        <textarea
          id="appointment-notes"
          placeholder="Chia sẻ lý do bạn muốn đặt lịch..."
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? 'notes-error' : undefined}
          rows={4}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors resize-none"
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
          }}
          {...register('notes')}
        />
        {errors.notes && (
          <p id="notes-error" className="mt-1 text-sm text-crisis" role="alert">
            {errors.notes.message}
          </p>
        )}
      </div>

      {isError && (
        <div className="rounded-lg bg-crisis-surface border border-crisis/20 px-4 py-3" role="alert">
          <p className="text-sm text-crisis">
            {error instanceof Error ? error.message : 'Không thể đặt lịch. Vui lòng thử lại.'}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-accent-sage text-white font-medium py-2.5 px-6 transition-colors hover:bg-accent-sage/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang đặt lịch...
          </span>
        ) : (
          'Đặt lịch hẹn'
        )}
      </button>
    </form>
  )
}
