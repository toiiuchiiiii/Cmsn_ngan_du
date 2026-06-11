import { useCallback } from 'react'
import { useDiaryEntries, useCreateDiaryEntry, useDeleteDiaryEntry } from '@/hooks/use-diary'
import { EntryCard } from './entry-card'
import { EntryCreate } from './entry-create'
import { EmptyState } from './empty-state'
import type { CreateEntryFormData } from '@/lib/diary-schemas'

export function DiaryPage() {
  const { data, isLoading, isError, error, refetch } = useDiaryEntries()
  const createMutation = useCreateDiaryEntry()
  const deleteMutation = useDeleteDiaryEntry()

  const entries = data?.entries ?? []

  const handleCreate = useCallback(
    async (formData: CreateEntryFormData) => {
      await createMutation.mutateAsync(formData)
    },
    [createMutation],
  )

  const handleDelete = useCallback(
    (id: number) => {
      deleteMutation.mutate(id)
    },
    [deleteMutation],
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3" aria-busy="true" role="status">
          <div className="h-24 bg-surface-hover rounded-lg animate-pulse" />
          <div className="h-24 bg-surface-hover rounded-lg animate-pulse" />
          <div className="h-24 bg-surface-hover rounded-lg animate-pulse" />
          <span className="sr-only">Đang tải nhật ký...</span>
        </div>
      )
    }

    if (isError) {
      return (
        <div
          className="rounded-lg bg-crisis-surface border border-crisis/20 px-5 py-4 text-center"
          role="alert"
        >
          <p className="text-sm text-crisis mb-3">
            {error instanceof Error ? error.message : 'Không thể tải nhật ký. Vui lòng thử lại.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-accent-sage text-white text-sm font-medium py-2 px-5 transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
          >
            Thử lại
          </button>
        </div>
      )
    }

    if (entries.length === 0) {
      return (
        <EmptyState
          icon={
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <rect x="8" y="12" width="48" height="44" rx="6" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M24 28h16M24 36h16M24 44h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="44" cy="48" r="14" fill="currentColor" opacity="0.1" />
              <path d="M44 42v12M38 48h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
          message="Hãy viết dòng đầu tiên"
          actionLabel="Viết nhật ký"
          onAction={() => {
            document.getElementById('entry-create-form')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      )
    }

    return (
      <div className="space-y-3">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-fg-primary">Nhật ký tâm trạng</h1>
        <p className="text-fg-secondary text-sm mt-1">Ghi lại cảm xúc mỗi ngày để theo dõi sức khỏe tinh thần</p>
      </header>

      <section id="entry-create-form" aria-labelledby="create-heading">
        <h2 id="create-heading" className="sr-only">Tạo mục nhật ký mới</h2>
        <EntryCreate onSubmit={handleCreate} isLoading={createMutation.isPending} />
      </section>

      <section aria-labelledby="entries-heading" className="space-y-4">
        <h2 id="entries-heading" className="font-serif text-xl text-fg-primary">
          Nhật ký của bạn
        </h2>
        <div className="min-h-[100px]">
          {renderContent()}
        </div>
      </section>
    </div>
  )
}
