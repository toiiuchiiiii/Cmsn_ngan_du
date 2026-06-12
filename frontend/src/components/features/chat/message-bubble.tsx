import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showDateSeparator?: boolean
  dateSeparator?: string
  isGroupStart?: boolean
  isGroupEnd?: boolean
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

export function MessageBubble({ message, isOwn, showDateSeparator, dateSeparator, isGroupStart, isGroupEnd }: MessageBubbleProps) {
  const topGap = isGroupStart ? 'mt-3' : 'mt-[2px]'
  const roundedOwn = isGroupEnd ? 'rounded-[18px] rounded-br-[4px]' : 'rounded-[18px]'
  const roundedOther = isGroupEnd ? 'rounded-[18px] rounded-bl-[4px]' : 'rounded-[18px]'

  return (
    <>
      {showDateSeparator && dateSeparator && (
        <div className="flex justify-center py-2">
          <span className="text-[11px] text-fg-tertiary bg-white/80 px-3 py-1 rounded-full shadow-sm">
            {formatDateSeparator(dateSeparator)}
          </span>
        </div>
      )}

      {isOwn ? (
        <div className={`flex justify-end px-4 ${topGap}`}>
          <div className={`max-w-[75%] bg-[#0084ff] text-white ${roundedOwn} px-3 py-[6px] shadow-sm`}>
            <p className="text-[15px] leading-[1.35] whitespace-pre-wrap break-words">{message.text}</p>
            <div className="flex items-center justify-end gap-1 -mb-[2px] -mr-[2px] mt-[2px]">
              <span className="text-[11px] text-white/70">{formatTime(message.created_at)}</span>
              <span className="text-[11px] text-white/70">
                {message.is_read ? (
                  <svg width="14" height="14" viewBox="0 0 22 16" fill="none">
                    <path d="M16 2L6 12l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 2L11 12l-1.5-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 11" fill="none">
                    <path d="M15 1L6 10l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex justify-start px-4 ${topGap}`}>
          <div className={`max-w-[75%] bg-white text-fg-primary ${roundedOther} px-3 py-[6px] shadow-sm border border-border/20`}>
            <p className="text-[15px] leading-[1.35] whitespace-pre-wrap break-words">{message.text}</p>
            <div className="flex items-center justify-start gap-1 -mb-[2px] -mr-[2px] mt-[2px]">
              <span className="text-[11px] text-fg-tertiary/60">{formatTime(message.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}