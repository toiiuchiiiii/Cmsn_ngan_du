import { useState, useMemo } from 'react'
import { ScrollPicker } from '@/components/ui/scroll-picker'
import { TimeSlotPicker } from '@/components/ui/time-slot-picker'
import type { CreateAppointmentFormData } from '@/lib/appointment-schemas'

interface AppointmentBookProps {
  onSubmit: (data: CreateAppointmentFormData) => Promise<void>
  isLoading?: boolean
  isError?: boolean
  error?: Error | null
}

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function AppointmentBook({ onSubmit, isLoading, isError, error }: AppointmentBookProps) {
  const now = useMemo(() => new Date(), [])

  // Date state
  const [selectedDay, setSelectedDay] = useState(now.getDate().toString())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  // Generate lists for pickers
  const years = useMemo(() => {
    const y: string[] = []
    for (let i = now.getFullYear(); i <= now.getFullYear() + 2; i++) {
      y.push(i.toString())
    }
    return y
  }, [now])

  const days = useMemo(() => {
    const max = getDaysInMonth(selectedYear, selectedMonth)
    const d: string[] = []
    for (let i = 1; i <= max; i++) {
      d.push(i.toString())
    }
    return d
  }, [selectedYear, selectedMonth])

  const months = useMemo(() => {
    if (selectedYear === now.getFullYear()) {
      return MONTHS.slice(now.getMonth())
    }
    return MONTHS
  }, [selectedYear, now])

  const handleMonthChange = (monthLabel: string) => {
    const monthNum = MONTHS.indexOf(monthLabel) + 1
    setSelectedMonth(monthNum)
    const max = getDaysInMonth(selectedYear, monthNum)
    if (parseInt(selectedDay) > max) {
      setSelectedDay(max.toString())
    }
  }

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr)
    setSelectedYear(year)
    if (year === now.getFullYear()) {
      const newMonth = now.getMonth() + 1
      setSelectedMonth(newMonth)
    }
    const max = getDaysInMonth(year, selectedMonth)
    if (parseInt(selectedDay) > max) {
      setSelectedDay(max.toString())
    }
  }

  const buildDateString = (): string => {
    const month = selectedMonth.toString().padStart(2, '0')
    const day = selectedDay.padStart(2, '0')
    const time = selectedTime || '08:00'
    return `${selectedYear}-${month}-${day}T${time}:00.000Z`
  }

  const handleSubmit = async () => {
    const dateStr = buildDateString()
    await onSubmit({ date_time: dateStr, notes: notes || undefined })
    setSelectedTime(null)
    setNotes('')
  }

  const hasValidDate = selectedDay && selectedMonth && selectedYear
  const canSubmit = hasValidDate && selectedTime

  return (
    <div className="space-y-6">
      {/* Scroll Wheel Date Picker */}
      <div>
        <p className="text-sm font-medium text-fg-secondary mb-4 text-center">Chọn ngày</p>
        <div className="flex items-start justify-center gap-4">
          {/* Day */}
          <div className="flex-1 max-w-[80px]">
            <ScrollPicker
              label="Ngày"
              items={days}
              value={selectedDay}
              onChange={(v) => setSelectedDay(v)}
            />
          </div>
          {/* Month */}
          <div className="flex-1 max-w-[110px]">
            <ScrollPicker
              label="Tháng"
              items={months}
              value={MONTHS[selectedMonth - 1]}
              onChange={handleMonthChange}
            />
          </div>
          {/* Year */}
          <div className="flex-1 max-w-[90px]">
            <ScrollPicker
              label="Năm"
              items={years}
              value={selectedYear.toString()}
              onChange={handleYearChange}
            />
          </div>
        </div>
      </div>

      {/* Time Slot Picker */}
      {hasValidDate && (
        <div className="pt-2">
          <TimeSlotPicker
            selectedSlot={selectedTime}
            onSelect={setSelectedTime}
          />
        </div>
      )}

      {/* Selected date summary */}
      {canSubmit && (
        <div className="rounded-xl bg-accent-sage/10 border border-accent-sage/20 px-4 py-3 text-center">
          <p className="text-sm text-fg-secondary">
            <span className="font-medium text-fg-primary">Đã chọn:</span>{' '}
            {selectedDay}/{selectedMonth.toString().padStart(2, '0')}/{selectedYear}{' '}
            lúc <span className="font-semibold text-accent-sage">{selectedTime}</span>
          </p>
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="appointment-notes" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Ghi chú <span className="text-fg-tertiary">(không bắt buộc)</span>
        </label>
        <textarea
          id="appointment-notes"
          placeholder="Chia sẻ lý do bạn muốn đặt lịch..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors resize-none"
        />
      </div>

      {isError && (
        <div className="rounded-lg bg-crisis-surface border border-crisis/20 px-4 py-3" role="alert">
          <p className="text-sm text-crisis">
            {error instanceof Error ? error.message : 'Không thể đặt lịch. Vui lòng thử lại.'}
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={!canSubmit || isLoading}
        onClick={handleSubmit}
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
    </div>
  )
}
