import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 text-fg-tertiary">{icon}</div>
      <p className="text-fg-secondary text-lg mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-full bg-accent-sage text-white font-medium py-2.5 px-6 transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
