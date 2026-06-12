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
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
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
      {
        onSuccess: () => {
          setText('')
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
          }
        },
      },
    )
  }, [text, activeConversationId, sendMutation])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    },
    [conversationId],
  )

  return (
    <div className="border-t border-border px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          rows={1}
          aria-label="Tin nhắn"
          className="flex-1 resize-none rounded-xl bg-surface px-4 py-2.5 text-sm text-fg-primary placeholder:text-fg-disabled outline-none border border-border focus:border-accent-sage transition-colors min-h-[44px] max-h-[160px] leading-relaxed"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          aria-label="Gửi tin nhắn"
          className="flex-shrink-0 rounded-full bg-accent-sage text-white p-3 transition-colors hover:bg-accent-sage/90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
        >
          {sendMutation.isPending ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
