import { MOODS, MOOD_LABELS, MOOD_EMOJIS, type Mood } from '@/lib/diary-schemas'

interface MoodSelectorProps {
  value: Mood | null
  onChange: (mood: Mood) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" role="radiogroup" aria-label="Chọn tâm trạng">
      {MOODS.map((mood) => {
        const isSelected = value === mood
        return (
          <button
            key={mood}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-pressed={isSelected}
            aria-label={MOOD_LABELS[mood]}
            onClick={() => onChange(mood)}
            className={`
              flex flex-col items-center gap-1 rounded-xl p-3 transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2
              ${isSelected
                ? 'bg-accent-sage-surface border-2 border-accent-sage'
                : 'bg-surface border-2 border-border hover:border-accent-sage/50'
              }
            `}
          >
            <span className="text-2xl" aria-hidden="true">{MOOD_EMOJIS[mood]}</span>
            <span className={`text-xs font-medium ${isSelected ? 'text-accent-sage' : 'text-fg-secondary'}`}>
              {MOOD_LABELS[mood]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
