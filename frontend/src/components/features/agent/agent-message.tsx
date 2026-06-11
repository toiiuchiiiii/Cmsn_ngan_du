import type { AgentMessage } from '@/types'

interface AgentMessageProps {
  message: AgentMessage
}

export function AgentMessage({ message }: AgentMessageProps) {
  const isBot = message.role === 'bot'

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} px-4 mb-2`}>
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
          isBot
            ? 'bg-accent-sage-surface text-fg-primary rounded-bl-sm'
            : 'bg-accent-sage text-white rounded-br-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>
      </div>
    </div>
  )
}

export function TypingDots() {
  return (
    <div className="flex justify-start px-4 mb-2" aria-live="polite">
      <div className="bg-accent-sage-surface rounded-xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="w-2 h-2 rounded-full bg-accent-sage/50 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-accent-sage/50 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-accent-sage/50 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
