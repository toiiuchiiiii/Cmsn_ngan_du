import type { Conversation } from '@/types'
import { useAuthStore } from '@/stores/auth-store'

interface ContactItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(id: number) {
  const colors = [
    'bg-accent-sage',
    'bg-accent-rose',
    'bg-accent-lavender',
    'bg-warning',
    'bg-crisis',
  ]
  return colors[id % colors.length]
}

function formatLastTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)

  if (hours < 1) return 'Vừa xong'
  if (hours < 24) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (hours < 48) return 'Hôm qua'
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}...` : text
}

export function ContactItem({
  conversation,
  isActive,
  onClick,
}: ContactItemProps) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const other = conversation.participants.find((p) => p.id !== currentUserId)
  const name = other?.name ?? 'Đã xóa'
  const lastMsg = conversation.last_message
  const hasUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_id !== currentUserId

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-sage ${
        isActive
          ? 'bg-accent-sage-surface'
          : 'hover:bg-surface-hover'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white ${getAvatarColor(conversation.id)}`}
          aria-hidden="true"
        >
          {getInitials(name)}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            other && 'is_online' in other && (other as { is_online?: boolean }).is_online
              ? 'bg-success'
              : 'bg-fg-disabled'
          }`}
          aria-label={
            other && 'is_online' in other && (other as { is_online?: boolean }).is_online
              ? 'Đang hoạt động'
              : 'Không hoạt động'
          }
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-fg-primary truncate">
            {name}
          </span>
          {lastMsg && (
            <span className="text-[10px] text-fg-tertiary flex-shrink-0">
              {formatLastTime(lastMsg.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-fg-tertiary truncate">
            {lastMsg ? truncate(lastMsg.text, 40) : 'Chưa có tin nhắn'}
          </span>
          {hasUnread && (
            <span className="w-2 h-2 rounded-full bg-accent-sage flex-shrink-0" aria-label="Tin nhắn chưa đọc" />
          )}
        </div>
      </div>
    </button>
  )
}
