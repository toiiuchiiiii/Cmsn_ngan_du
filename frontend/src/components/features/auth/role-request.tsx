import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api'

interface RoleRequestItem {
  id: number
  userId: number
  reason: string
  status: string
  createdAt: string
  userName: string
  userEmail: string
}

export function RoleRequestPage() {
  const { user } = useAuthStore()
  const role = user?.role ?? 'patient'
  const [reason, setReason] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [requests, setRequests] = useState<RoleRequestItem[]>([])
  const [tab, setTab] = useState<'request' | 'manage'>('request')

  const canManage = role === 'admin'

  useEffect(() => {
    if (!canManage) return
    const fetch = async () => {
      try {
        const res = await api.get('admin/role-requests').json<{ success: boolean; data: RoleRequestItem[] }>()
        setRequests(res.data ?? [])
      } catch { /* ignore */ }
    }
    fetch()
  }, [canManage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('admin/role-request', { json: { reason } })
      setSent(true)
    } catch (err: any) {
      const msg = err?.message || 'Gửi yêu cầu thất bại'
      setError(msg)
    }
  }

  const handleReview = async (id: number, action: 'approved' | 'rejected') => {
    try {
      await api.patch(`admin/role-requests/${id}`, { json: { action } })
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action === 'approved' ? 'approved' : 'rejected' } : r))
    } catch { /* ignore */ }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {canManage && (
        <div className="flex gap-2 mb-8">
          <button
            type="button"
            onClick={() => setTab('request')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${tab === 'request' ? 'bg-accent-sage text-white' : 'border border-border text-fg-secondary hover:bg-surface-hover'}`}
          >
            Gửi yêu cầu
          </button>
          <button
            type="button"
            onClick={() => setTab('manage')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${tab === 'manage' ? 'bg-accent-sage text-white' : 'border border-border text-fg-secondary hover:bg-surface-hover'}`}
          >
            Quản lý yêu cầu ({requests.filter(r => r.status === 'pending').length})
          </button>
        </div>
      )}

      {tab === 'manage' && canManage && (
        <div>
          <h1 className="font-serif text-2xl text-fg-primary mb-6">Yêu cầu làm tư vấn viên</h1>
          {requests.length === 0 ? (
            <p className="text-fg-tertiary text-sm">Chưa có yêu cầu nào.</p>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-fg-primary text-sm">{r.userName}</p>
                      <p className="text-xs text-fg-tertiary">{r.userEmail}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      r.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      r.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {r.status === 'pending' ? 'Chờ duyệt' : r.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                    </span>
                  </div>
                  {r.reason && <p className="text-sm text-fg-secondary mb-3">{r.reason}</p>}
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleReview(r.id, 'approved')}
                        className="rounded-full bg-accent-sage text-white px-4 py-1.5 text-xs font-medium hover:bg-accent-sage/90 transition-colors">
                        Phê duyệt
                      </button>
                      <button type="button" onClick={() => handleReview(r.id, 'rejected')}
                        className="rounded-full border border-border px-4 py-1.5 text-xs text-fg-secondary hover:bg-surface-hover transition-colors">
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'request' && (
        <>
          <h1 className="font-serif text-2xl text-fg-primary mb-2">Trở thành tư vấn viên</h1>
          <p className="text-sm text-fg-tertiary mb-8">Gửi yêu cầu để admin phê duyệt quyền tư vấn viên</p>

          {sent ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-accent-sage-surface flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-sage">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="font-serif text-lg text-fg-primary mb-2">Yêu cầu đã gửi!</h2>
              <p className="text-sm text-fg-tertiary">Admin sẽ xem xét và phê duyệt yêu cầu của bạn.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-fg-secondary mb-1.5">Lý do (không bắt buộc)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Chia sẻ lý do bạn muốn trở thành tư vấn viên..."
                  className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage resize-none"
                  rows={4}
                />
              </div>
              {error && <p className="text-sm text-crisis">{error}</p>}
              <button type="submit"
                className="rounded-full bg-accent-sage text-white px-8 py-2.5 text-sm font-medium hover:bg-accent-sage/90 transition-colors"
              >
                Gửi yêu cầu
              </button>
            </form>
          )}
        </>
      )}
    </main>
  )
}
