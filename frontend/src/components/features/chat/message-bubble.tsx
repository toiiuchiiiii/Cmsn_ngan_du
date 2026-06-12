import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showDateSeparator?: boolean
  dateSeparator?: string
  isFirstOfGroup?: boolean
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
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

export function MessageBubble({
  message,
  isOwn,
  showDateSeparator,
  dateSeparator,
  isFirstOfGroup,
}: MessageBubbleProps) {
  const showAvatar = !isOwn && isFirstOfGroup

  return (
    <>
      {showDateSeparator && dateSeparator && (
        <div className="flex justify-center py-2">
          <span className="text-[11px] text-fg-tertiary bg-white/80 px-3 py-1 rounded-full shadow-sm">
            {formatDateSeparator(dateSeparator)}
          </span>
        </div>
      )}

      <div className={`flex items-end gap-1.5 px-3 py-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {!isOwn && (
          <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-semibold text-white opacity-0"
            style={{ opacity: showAvatar ? 1 : 0, visibility: showAvatar ? 'visible' : 'hidden' }}
          >
            {(message.sender_id % 1000).toString().slice(0, 2)}
          </div>
        )}

        <div
          className={`relative max-w-[75%] px-3 py-2 ${
            isOwn
              ? 'bg-[#0084ff] text-white rounded-[18px] rounded-br-[4px]'
              : 'bg-white text-fg-primary rounded-[18px] rounded-bl-[4px] shadow-sm border border-border/30'
          } ${isFirstOfGroup ? (isOwn ? 'rounded-br-[4px]' : 'rounded-bl-[4px]') : (isOwn ? 'rounded-br-[18px]' : 'rounded-bl-[18px]')}`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>

          <div className={`flex items-center gap-1 -mb-1 -mr-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-fg-tertiary/60'}`}>
              {formatTime(message.created_at)}
            </span>
            {isOwn && (
              <span className="text-[10px] text-white/70">
                {message.is_read ? (
                  <svg width="14" height="14" viewBox="0 0 22 16" fill="none" className="text-white/70">
                    <path d="M16 2L6 12l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 2L11 12l-1.5-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 11" fill="none" className="text-white/50">
                    <path d="M15 1L6 10l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>

        {isOwn && <div className="w-7 h-7 flex-shrink-0" />}
      </div>
    </>
  )
}
