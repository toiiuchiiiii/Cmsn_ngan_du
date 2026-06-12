import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import { useConversations, useTherapists, useCreateConversation } from '@/hooks/use-chat'
import { ContactItem } from './contact-item'

interface ContactListProps {
  onSelectConversation: (id: number) => void
}

function ContactListSkeleton() {
  return (
    <div className="space-y-1" aria-busy="true" role="status">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-12 h-12 rounded-full bg-surface-hover animate-pulse" />
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
  const [search, setSearch] = useState('')
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const setActiveConversation = useChatStore((s) => s.setActiveConversation)
  const conversations = useChatStore((s) => s.conversations)
  const currentUser = useAuthStore((s) => s.user)
  const [startedIds, setStartedIds] = useState<Set<number>>(new Set())

  const { isLoading, isError, error, refetch } = useConversations()
  const therapistsQuery = useTherapists()
  const createConv = useCreateConversation()

  const therapists = therapistsQuery.data ?? []
  const existingContactIds = new Set(
    conversations.map(c => c.participants?.find(p => p.id !== currentUser?.id)?.id).filter(Boolean)
  )
  const availableTherapists = therapists.filter(t => !existingContactIds.has(t.id) && !startedIds.has(t.id))

  const filteredConversations = conversations.filter(c => {
    if (!search.trim()) return true
    const other = c.participants.find(p => p.id !== currentUser?.id)
    return other?.name?.toLowerCase().includes(search.toLowerCase())
  })

  const handleStartChat = async (therapistId: number) => {
    try {
      const conv = await createConv.mutateAsync({ contactId: therapistId })
      setActiveConversation(conv.id)
      onSelectConversation(conv.id)
      setStartedIds(prev => new Set([...prev, therapistId]))
    } catch { /* ignore */ }
  }

  if (isLoading) return <ContactListSkeleton />

  if (isError) {
    return (
      <div className="p-4" role="alert">
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-center">
          <p className="text-xs text-rose-600 mb-2">
            {error instanceof Error ? error.message : 'Không thể tải danh sách'}
          </p>
          <button type="button" onClick={() => refetch()}
            className="rounded-full bg-accent-sage text-white text-xs font-medium py-1.5 px-4 transition-colors hover:bg-accent-sage/90">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const hasContent = conversations.length > 0 || availableTherapists.length > 0

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-fg-primary mb-2">Đoạn chat</h1>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full rounded-xl bg-surface border border-border pl-9 pr-4 py-2 text-sm text-fg-primary placeholder:text-fg-disabled outline-none focus:border-accent-sage transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasContent ? (
          <div className="flex flex-col items-center py-16 px-4 text-center">
            <div className="mb-4 w-16 h-16 rounded-full bg-accent-sage/10 flex items-center justify-center text-accent-sage">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-fg-secondary text-sm mb-1">Chưa có cuộc trò chuyện nào</p>
            <p className="text-fg-tertiary text-xs">Hãy bắt đầu trò chuyện với tư vấn viên</p>
          </div>
        ) : (
          <>
            {filteredConversations.length > 0 && (
              <div>
                <div className="px-4 pt-2 pb-1">
                  <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wider">
                    Gần đây
                  </p>
                </div>
                <div className="divide-y divide-border/50" role="list">
                  {filteredConversations.map((conv) => (
                    <ContactItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === activeConversationId}
                      onClick={() => {
                        setActiveConversation(conv.id)
                        onSelectConversation(conv.id)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {availableTherapists.length > 0 && !search && (
              <div className="mt-2">
                <div className="px-4 pt-2 pb-1">
                  <p className="text-[11px] font-semibold text-fg-tertiary uppercase tracking-wider">
                    Tư vấn viên
                  </p>
                </div>
                <div className="space-y-0.5 px-2">
                  {availableTherapists.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleStartChat(t.id)}
                      disabled={createConv.isPending}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent-lavender/10 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 shadow-sm">
                        {t.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'TV'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-fg-primary truncate">{t.name}</p>
                        <p className="text-xs text-violet-500 font-medium">Tư vấn viên</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-accent-sage font-medium">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        Nhắn tin
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {search && filteredConversations.length === 0 && (
              <div className="flex flex-col items-center py-12 px-4 text-center">
                <p className="text-fg-tertiary text-sm">Không tìm thấy kết quả</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
