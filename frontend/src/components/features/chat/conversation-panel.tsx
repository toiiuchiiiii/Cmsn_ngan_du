import { useRef, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import { useMessages } from '@/hooks/use-chat'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'

interface ConversationPanelProps {
  onBack?: () => void
}

export function ConversationPanel({ onBack }: ConversationPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const conversations = useChatStore((s) => s.conversations)
  const messagesMap = useChatStore((s) => s.messages)
  const currentUserId = useAuthStore((s) => s.user?.id)

  useMessages(activeConversationId)

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  )
  const other = activeConversation?.participants.find(
    (p) => p.id !== currentUserId,
  )
  const isOtherOnline =
    other && 'is_online' in other && (other as { is_online?: boolean }).is_online

  const messages = activeConversationId
    ? messagesMap.get(activeConversationId) ?? []
    : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!activeConversationId || !activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-fg-tertiary">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="text-fg-tertiary text-sm">Chọn một cuộc trò chuyện</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-border px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-1 -ml-1 rounded-full text-fg-secondary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
            aria-label="Quay lại danh sách"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-accent-sage flex items-center justify-center text-sm font-medium text-white flex-shrink-0" aria-hidden="true">
          {other?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-fg-primary truncate">
            {other?.name ?? 'Đã xóa'}
          </p>
          <p className="text-xs text-fg-tertiary">
            {isOtherOnline ? 'Đang hoạt động' : 'Không hoạt động'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-fg-tertiary">Chưa có tin nhắn nào. Hãy gửi lời chào!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prevMsg = idx > 0 ? messages[idx - 1] : null
            const showDateSep =
              !prevMsg ||
              new Date(msg.created_at).toDateString() !==
                new Date(prevMsg.created_at).toDateString()

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === currentUserId}
                showDateSeparator={showDateSep}
                dateSeparator={msg.created_at}
              />
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput conversationId={activeConversationId} />
    </div>
  )
}
