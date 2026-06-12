import { useState, useRef, useCallback, useEffect } from 'react'
import { socketManager } from '@/lib/socket'
import { useChatStore } from '@/stores/chat-store'
import { useSendMessage } from '@/hooks/use-chat'

const TYPING_THROTTLE = 2000
const TYPING_STOP_DELAY = 3000

interface ChatInputProps {
  conversationId: number
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastTypingSent = useRef(0)
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const sendMutation = useSendMessage()
  const activeConversationId = useChatStore((s) => s.activeConversationId)

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }
  }, [])

  useEffect(() => {
    autoResize()
  }, [text, autoResize])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || !activeConversationId || sendMutation.isPending) return
    sendMutation.mutate(
      { conversation_id: activeConversationId, text: trimmed },
      { onSuccess: () => {
        setText('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
      }},
    )
  }, [text, activeConversationId, sendMutation])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const now = Date.now()
    if (now - lastTypingSent.current > TYPING_THROTTLE) {
      lastTypingSent.current = now
      socketManager.send('typing.start', { conversationId })
    }
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current)
    typingStopTimer.current = setTimeout(() => {
      socketManager.send('typing.stop', { conversationId })
    }, TYPING_STOP_DELAY)
  }, [conversationId])

  return (
    <div className="bg-surface/80 backdrop-blur-md border-t border-border px-3 py-2">
      <div className="flex items-end gap-2 bg-white rounded-2xl border border-border/60 px-3 py-1 focus-within:border-accent-sage/50 transition-colors shadow-sm">
        <button
          type="button"
          className="p-1.5 rounded-full text-fg-tertiary hover:text-accent-sage hover:bg-surface-hover transition-colors flex-shrink-0"
          aria-label="Đính kèm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          rows={1}
          className="flex-1 resize-none bg-transparent py-2 text-sm text-fg-primary placeholder:text-fg-disabled outline-none min-h-[36px] max-h-[120px] leading-relaxed"
        />

        <button
          type="button"
          className="p-1.5 rounded-full text-fg-tertiary hover:text-amber-500 hover:bg-surface-hover transition-colors flex-shrink-0"
          aria-label="Biểu tượng cảm xúc"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="flex-shrink-0 rounded-full bg-[#0084ff] text-white p-2 transition-colors hover:bg-[#0073e6] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Gửi"
        >
          {sendMutation.isPending ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
