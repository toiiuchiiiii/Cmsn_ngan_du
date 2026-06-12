import { useState } from 'react'
import { MOOD_EMOJIS, type Mood } from '@/lib/diary-schemas'
import type { DiaryEntry } from '@/types'

interface EntryCardProps {
  entry: DiaryEntry
  onDelete: (id: number) => void
}

export function EntryCard({ entry, onDelete }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const mood = entry.mood as Mood
  const emoji = MOOD_EMOJIS[mood] || '📝'
  const created = new Date(entry.created_at)
  const savedTime = created.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })

  const handleDelete = () => {
    if (confirming) {
      onDelete(entry.id)
      setConfirming(false)
    } else {
      setConfirming(true)
    }
  }

  return (
    <article
      className="rounded-lg bg-surface border border-border p-4 transition-colors hover:border-border-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage rounded"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg" aria-hidden="true">{emoji}</span>
          </div>

          <p className={`text-sm text-fg-secondary leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {entry.content}
          </p>
        </button>

        <div className="shrink-0 relative">
          {confirming ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs rounded-full bg-crisis text-white px-2.5 py-1 transition-colors hover:bg-crisis/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crisis"
              >
                Xoá
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-xs rounded-full border border-border px-2.5 py-1 text-fg-secondary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
              >
                Huỷ
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="text-fg-tertiary hover:text-crisis transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
              aria-label="Xóa mục nhật ký"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-accent-lavender-surface px-2.5 py-0.5 text-xs text-accent-lavender"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-border/50 flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fg-tertiary/50" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <time className="text-[11px] text-fg-tertiary/60" dateTime={entry.created_at}>
          Đã lưu lúc {savedTime}
        </time>
      </div>
    </article>
  )
}
