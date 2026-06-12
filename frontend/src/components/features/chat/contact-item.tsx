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

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (mins < 1) return 'Bây giờ'
  if (mins < 60) return `${mins}p`
  if (hours < 24) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  if (hours < 48) return 'Hôm qua'
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + '...' : text
}

export function ContactItem({ conversation, isActive, onClick }: ContactItemProps) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const other = conversation.participants.find((p) => p.id !== currentUserId)
  const name = other?.name ?? 'Đã xóa'
  const lastMsg = conversation.last_message
  const hasUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_id !== currentUserId

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none ${
        isActive ? 'bg-accent-sage/10' : 'hover:bg-surface-hover active:bg-surface-hover'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center text-sm font-semibold text-white shadow-sm`}
        >
          {getInitials(name)}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[2.5px] border-white ${
            other && 'is_online' in other && (other as { is_online?: boolean }).is_online
              ? 'bg-emerald-500'
              : 'bg-gray-300'
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-fg-primary truncate">{name}</span>
          {lastMsg && (
            <span className="text-[11px] text-fg-tertiary/70 flex-shrink-0">{formatTime(lastMsg.created_at)}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-[13px] text-fg-tertiary truncate leading-snug">
            {lastMsg ? truncate(lastMsg.text, 50) : 'Bắt đầu trò chuyện'}
          </span>
          {hasUnread && (
            <span className="w-2 h-2 rounded-full bg-accent-sage flex-shrink-0" />
          )}
        </div>
      </div>
    </button>
  )
}
