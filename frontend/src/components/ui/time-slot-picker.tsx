interface TimeSlotPickerProps {
  selectedSlot: string | null
  onSelect: (time: string) => void
}

function generateSlots(start: number, end: number): string[] {
  const slots: string[] = []
  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }
  }
  return slots
}

const MORNING_SLOTS = generateSlots(8, 11)
const AFTERNOON_SLOTS = generateSlots(14, 17)

export function TimeSlotPicker({ selectedSlot, onSelect }: TimeSlotPickerProps) {

  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-tertiary font-medium">Chọn khung giờ</p>

      {/* Morning */}
      <div>
        <span className="text-xs text-fg-secondary block mb-1.5">Sáng (8:00 - 11:00)</span>
        <div className="grid grid-cols-4 gap-2">
          {MORNING_SLOTS.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => onSelect(time)}
              className={`py-2 px-1 rounded-lg text-sm font-medium transition-all border
                ${selectedSlot === time
                  ? 'bg-accent-sage text-white border-accent-sage shadow-sm'
                  : 'bg-surface border-border text-fg-secondary hover:border-accent-sage hover:text-fg-primary'
                }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Afternoon */}
      <div>
        <span className="text-xs text-fg-secondary block mb-1.5">Chiều (14:00 - 17:00)</span>
        <div className="grid grid-cols-4 gap-2">
          {AFTERNOON_SLOTS.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => onSelect(time)}
              className={`py-2 px-1 rounded-lg text-sm font-medium transition-all border
                ${selectedSlot === time
                  ? 'bg-accent-sage text-white border-accent-sage shadow-sm'
                  : 'bg-surface border-border text-fg-secondary hover:border-accent-sage hover:text-fg-primary'
                }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
