import { useEffect } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useConversations, useContacts } from '@/hooks/use-chat'
import { ContactItem } from './contact-item'

interface ContactListProps {
  onSelectConversation: (id: number) => void
}

function ContactListSkeleton() {
  return (
    <div className="space-y-1" aria-busy="true" role="status">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-surface-hover animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-surface-hover rounded animate-pulse" />
            <div className="h-2.5 w-32 bg-surface-hover rounded animate-pulse" />
          </div>
        </div>
      ))}
      <span className="sr-only">Đang tải danh sách...</span>
    </div>
  )
}

export function ContactList({ onSelectConversation }: ContactListProps) {
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const setActiveConversation = useChatStore((s) => s.setActiveConversation)
  const setConversations = useChatStore((s) => s.setConversations)
  const setContacts = useChatStore((s) => s.setContacts)

  const { data, isLoading, isError, error, refetch } = useConversations()
  const contactsQuery = useContacts()

  const convs = data?.conversations ?? []

  useEffect(() => {
    if (data?.conversations) {
      setConversations(data.conversations)
    }
  }, [data, setConversations])

  useEffect(() => {
    if (contactsQuery.data?.contacts) {
      setContacts(contactsQuery.data.contacts)
    }
  }, [contactsQuery.data, setContacts])

  if (isLoading) return <ContactListSkeleton />

  if (isError) {
    return (
      <div className="p-4" role="alert">
        <div className="rounded-lg bg-crisis-surface border border-crisis/20 px-4 py-3 text-center">
          <p className="text-xs text-crisis mb-2">
            {error instanceof Error ? error.message : 'Không thể tải danh sách'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-accent-sage text-white text-xs font-medium py-1.5 px-4 transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (convs.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 px-4 text-center">
        <div className="mb-4 text-fg-tertiary">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>
        <p className="text-fg-secondary text-sm mb-1">Chưa có cuộc trò chuyện nào</p>
        <p className="text-fg-tertiary text-xs">Hãy bắt đầu một cuộc trò chuyện mới</p>
      </div>
    )
  }

  const handleSelect = (id: number) => {
    setActiveConversation(id)
    onSelectConversation(id)
  }

  return (
    <div className="divide-y divide-border" role="list" aria-label="Danh sách hội thoại">
      {convs.map((conv) => (
        <div key={conv.id} role="listitem">
          <ContactItem
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onClick={() => handleSelect(conv.id)}
          />
        </div>
      ))}
    </div>
  )
}
