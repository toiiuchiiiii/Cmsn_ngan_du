import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showDateSeparator?: boolean
  dateSeparator?: string
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Hôm nay'
  if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua'
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
}

export function MessageBubble({
  message,
  isOwn,
  showDateSeparator,
  dateSeparator,
}: MessageBubbleProps) {
  return (
    <>
      {showDateSeparator && dateSeparator && (
        <div className="flex justify-center py-3">
          <span className="text-xs text-fg-tertiary bg-surface px-3 py-1 rounded-full">
            {formatDateSeparator(dateSeparator)}
          </span>
        </div>
      )}
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 mb-1`}>
        <div
          className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
            isOwn
              ? 'bg-accent-sage text-white rounded-br-sm'
              : 'bg-surface text-fg-primary rounded-bl-sm border border-border'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
          <div
            className={`flex items-center gap-1 mt-1 ${
              isOwn ? 'justify-end' : 'justify-start'
            }`}
          >
            <span
              className={`text-[10px] ${
                isOwn ? 'text-white/70' : 'text-fg-tertiary'
              }`}
            >
              {formatTime(message.created_at)}
            </span>
            {isOwn && (
              <span className="text-[10px] text-white/70" aria-label={message.is_read ? 'Đã xem' : 'Đã gửi'}>
                {message.is_read ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M18 6L7 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 6L11 17l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M18 6L7 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
