import { useRef, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import { useMessages } from '@/hooks/use-chat'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'

interface ConversationPanelProps {
  onBack?: () => void
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = [
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-sky-400 to-blue-500',
    'from-cyan-400 to-sky-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function ConversationPanel({ onBack }: ConversationPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const conversations = useChatStore((s) => s.conversations)
  const messagesMap = useChatStore((s) => s.messages)
  const currentUserId = useAuthStore((s) => s.user?.id)

  useMessages(activeConversationId)

  const activeConversation = conversations.find((c) => c.id === activeConversationId)
  const other = activeConversation?.participants.find((p) => p.id !== currentUserId)
  const isOtherOnline = other && 'is_online' in other && (other as { is_online?: boolean }).is_online

  const messages = activeConversationId ? messagesMap.get(activeConversationId) ?? [] : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!activeConversationId || !activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="mb-5 w-20 h-20 rounded-full bg-accent-sage/10 flex items-center justify-center mx-auto">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-sage">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="text-fg-tertiary text-sm font-medium">Chọn một cuộc trò chuyện</p>
          <p className="text-fg-tertiary/60 text-xs mt-1">Nhắn tin với tư vấn viên của bạn</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-surface/80 backdrop-blur-md border-b border-border px-4 py-2.5 flex items-center gap-3 sticky top-0 z-10">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1.5 rounded-full text-fg-secondary hover:bg-surface-hover transition-colors"
            aria-label="Quay lại"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(other?.name ?? '?')} flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 shadow-sm`}>
          {getInitials(other?.name ?? '?')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-fg-primary truncate">{other?.name ?? 'Đã xóa'}</p>
          <p className={`text-xs ${isOtherOnline ? 'text-emerald-500' : 'text-fg-tertiary'}`}>
            {isOtherOnline ? 'Đang hoạt động' : 'Không hoạt động'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 bg-[#f0f2f5]" style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, #e4e6eb 1px, transparent 0)', backgroundSize: '50px 50px' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <div className="text-center bg-white rounded-2xl px-6 py-4 shadow-sm">
              <p className="text-xs text-fg-tertiary">Chưa có tin nhắn nào</p>
              <p className="text-xs text-fg-tertiary/60 mt-1">Hãy gửi lời chào để bắt đầu!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prevMsg = idx > 0 ? messages[idx - 1] : null
            const showDateSep = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={Number(msg.sender_id) === Number(currentUserId)}
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
