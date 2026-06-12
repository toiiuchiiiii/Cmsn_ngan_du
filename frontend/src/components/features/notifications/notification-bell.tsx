import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { Bell } from 'lucide-react'

interface NotificationItem {
  id: number
  user_id: number
  type: string
  title: string
  message: string | null
  related_id: number | null
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const { isAuthenticated } = useAuthStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    const fetch = async () => {
      try {
        const res = await api.get('notifications').json<{ success: boolean; data: NotificationItem[] }>()
        setNotifs(res.data ?? [])
        setUnread(res.data?.filter(n => !n.is_read).length ?? 0)
      } catch { /* ignore */ }
    }
    fetch()
    const interval = setInterval(fetch, 15000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkRead = async (id: number) => {
    try {
      await api.patch(`notifications/${id}/read`)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch { /* ignore */ }
  }

  if (!isAuthenticated) return null

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="relative rounded-full p-2 text-fg-secondary hover:bg-surface-hover transition-colors">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-crisis text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 rounded-2xl border border-border bg-canvas shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-fg-primary">Thông báo</p>
          </div>
          <div className="overflow-y-auto max-h-80">
            {notifs.length === 0 ? (
              <p className="text-xs text-fg-tertiary text-center py-8">Chưa có thông báo</p>
            ) : (
              notifs.map(n => (
                <button key={n.id} type="button" onClick={() => handleMarkRead(n.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors border-b border-border last:border-b-0 ${!n.is_read ? 'bg-accent-sage-surface/30' : ''}`}>
                  <p className="text-sm font-medium text-fg-primary">{n.title}</p>
                  {n.message && <p className="text-xs text-fg-tertiary mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-[10px] text-fg-disabled mt-1">{new Date(n.created_at).toLocaleDateString('vi-VN')}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
