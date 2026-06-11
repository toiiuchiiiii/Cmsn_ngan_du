import { useTestHistory } from '@/hooks/use-tests'
import type { TestType } from '@/types'

interface TestHistoryProps {
  testTypes: TestType[]
  onViewResult: (result: NonNullable<ReturnType<typeof useTestHistory>['data']>['tests'][number]) => void
  onBack: () => void
}

function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    'Bình thường': '#7BA38B',
    'Nhẹ': '#C9A97C',
    'Vừa': '#D4A5A5',
    'Nặng': '#C97C7C',
  }
  return map[severity] || '#9CA3AF'
}

export function TestHistory({ testTypes, onViewResult, onBack }: TestHistoryProps) {
  const { data, isLoading, isError, error, refetch } = useTestHistory()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2" aria-busy="true" role="status">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-16 bg-surface-hover rounded-lg animate-pulse" />
          ))}
          <span className="sr-only">Đang tải lịch sử...</span>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="rounded-lg bg-crisis-surface border border-crisis/20 px-5 py-4 text-center" role="alert">
          <p className="text-sm text-crisis mb-3">
            {error instanceof Error ? error.message : 'Không thể tải lịch sử. Vui lòng thử lại.'}
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

    const tests = data?.tests ?? []

    if (tests.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 text-fg-tertiary">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <rect x="12" y="8" width="40" height="48" rx="6" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M24 24h16M24 32h16M24 40h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-fg-secondary text-lg mb-6">Chưa có bài kiểm tra nào</p>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full bg-accent-sage text-white font-medium py-2.5 px-6 text-sm transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
          >
            Làm bài kiểm tra
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {tests.map((test) => {
          const testType = testTypes.find((t) => t.id === test.test_type)
          const color = getSeverityColor(test.severity)
          return (
            <button
              key={test.id}
              type="button"
              onClick={() => onViewResult(test)}
              className="w-full text-left rounded-lg bg-surface border border-border p-4 transition-colors hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg-primary truncate">
                    {testType?.name || test.test_type}
                  </p>
                  <p className="text-xs text-fg-tertiary mt-0.5">
                    {new Date(test.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-sm font-semibold"
                    style={{ color }}
                  >
                    {test.score}
                  </span>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${color}1A`,
                      color,
                    }}
                  >
                    {test.severity}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-fg-tertiary" aria-hidden="true">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-fg-secondary hover:text-fg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage rounded"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Quay lại
        </button>
        <h2 className="font-serif text-xl text-fg-primary">Lịch sử bài kiểm tra</h2>
        <div className="w-20" />
      </div>

      {renderContent()}
    </div>
  )
}
