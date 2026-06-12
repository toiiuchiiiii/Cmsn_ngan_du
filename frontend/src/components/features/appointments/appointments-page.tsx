import { useState, useCallback } from 'react'
import { AppointmentBook } from './appointment-book'
import { AppointmentList } from './appointment-list'
import { TherapistAppointments } from './therapist-appointments'
import { useAuthStore } from '@/stores/auth-store'
import { useCreateAppointment } from '@/hooks/use-appointments'
import type { CreateAppointmentFormData } from '@/lib/appointment-schemas'

type Tab = 'book' | 'list'

export function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('book')
  const { isAuthenticated, user } = useAuthStore()
  const isTherapist = user?.role === 'therapist' || user?.role === 'admin'
  const createMutation = useCreateAppointment()

  const handleCreate = useCallback(
    async (data: CreateAppointmentFormData) => {
      await createMutation.mutateAsync(data)
      setActiveTab('list')
    },
    [createMutation],
  )

  if (!isAuthenticated) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="mb-6 text-fg-tertiary">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect x="8" y="8" width="48" height="48" rx="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M32 20v16M24 28h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-fg-primary mb-2">Vui lòng đăng nhập</h1>
        <p className="text-fg-secondary text-sm">Bạn cần đăng nhập để sử dụng tính năng này.</p>
      </main>
    )
  }

  if (isTherapist) {
    return <TherapistAppointments />
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-fg-primary">Lịch hẹn</h1>
        <p className="text-fg-secondary text-sm mt-1">Đặt lịch và theo dõi các buổi tư vấn của bạn</p>
      </header>

      <div className="flex gap-1 bg-surface rounded-xl p-1" role="tablist" aria-label="Lịch hẹn">
        <button
          id="tab-dat-lich"
          type="button"
          role="tab"
          aria-selected={activeTab === 'book'}
          aria-controls="panel-book"
          onClick={() => setActiveTab('book')}
          className={`flex-1 rounded-full py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'book' ? 'bg-accent-sage text-white' : 'text-fg-secondary hover:text-fg-primary'
          }`}
        >
          Đặt lịch
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'list'}
          aria-controls="panel-list"
          onClick={() => setActiveTab('list')}
          className={`flex-1 rounded-full py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'list' ? 'bg-accent-sage text-white' : 'text-fg-secondary hover:text-fg-primary'
          }`}
        >
          Lịch hẹn của tôi
        </button>
      </div>

      {activeTab === 'book' ? (
        <section id="panel-book" role="tabpanel" aria-labelledby="tab-dat-lich">
          <div className="rounded-xl bg-surface border border-border p-6">
            <h2 className="font-serif text-xl text-fg-primary mb-5">Đặt lịch hẹn mới</h2>
            <AppointmentBook onSubmit={handleCreate} isLoading={createMutation.isPending} isError={createMutation.isError} error={createMutation.error} />
          </div>
        </section>
      ) : (
        <section id="panel-list" role="tabpanel" aria-labelledby="tab-danh-sach">
          <AppointmentList />
        </section>
      )}
    </div>
  )
}
