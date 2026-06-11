import type { QuickAction } from '@/types'

interface AgentQuickActionsProps {
  actions: QuickAction[]
  onSelect: (action: QuickAction) => void
}

export function AgentQuickActions({ actions, onSelect }: AgentQuickActionsProps) {
  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onSelect(action)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-sm text-fg-secondary hover:bg-surface-hover hover:border-border-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
          >
            <span className="flex-shrink-0 text-base">{action.icon}</span>
            <span className="leading-snug">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
