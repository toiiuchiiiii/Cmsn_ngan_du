import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import { useWebSocket } from '@/hooks/use-web-socket'
import { useMarkAsRead } from '@/hooks/use-chat'
import { ContactList } from './contact-list'
import { ConversationPanel } from './conversation-panel'

export function ChatPage() {
  const [showPanel, setShowPanel] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const markAsReadMutation = useMarkAsRead()

  useWebSocket()

  useEffect(() => {
    if (activeConversationId) {
      markAsReadMutation.mutate(activeConversationId)
    }
  }, [activeConversationId])

  const handleSelectConversation = useCallback(
    (_id: number) => {
      setShowPanel(true)
    },
    [],
  )

  const handleBack = useCallback(() => {
    setShowPanel(false)
  }, [])

  if (!isAuthenticated) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="mb-6 text-fg-tertiary">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-fg-primary mb-2">Vui lòng đăng nhập</h1>
        <p className="text-fg-secondary text-sm">
          Bạn cần đăng nhập để sử dụng tính năng nhắn tin.
        </p>
      </main>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <section
        className={`w-full md:w-80 lg:w-96 border-r border-border flex-shrink-0 bg-canvas ${
          showPanel ? 'hidden md:flex' : 'flex'
        } flex-col`}
        aria-label="Danh sách hội thoại"
      >
        <div className="border-b border-border px-4 py-4">
          <h1 className="font-serif text-xl text-fg-primary">Tin nhắn</h1>
          <p className="text-xs text-fg-tertiary mt-0.5">Trò chuyện với chuyên gia tư vấn</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ContactList onSelectConversation={handleSelectConversation} />
        </div>
      </section>

      <section
        className={`flex-1 flex flex-col bg-canvas ${
          showPanel || 'hidden md:flex'
        }`}
        aria-label="Khung hội thoại"
      >
        <ConversationPanel onBack={handleBack} />
      </section>
    </div>
  )
}
