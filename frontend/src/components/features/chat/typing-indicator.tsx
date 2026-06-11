interface TypingIndicatorProps {
  name: string
}

export function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        <span className="w-1.5 h-1.5 rounded-full bg-fg-tertiary animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-fg-tertiary animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-fg-tertiary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-fg-tertiary italic">
        {name} đang gõ...
      </span>
    </div>
  )
}
