import type { TestType, SeverityLevel } from '@/types'

interface TestResultProps {
  test: TestType
  score: number
  severity: SeverityLevel
  onRetake: () => void
  onHistory: () => void
  onBackToList: () => void
}

function getSeverityIcon(severity: SeverityLevel) {
  if (severity.label === 'Bình thường') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke={severity.color} strokeWidth="2" />
        <path d="M16 28c0 0 2 6 8 6s8-6 8-6" stroke={severity.color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="18" cy="20" r="2" fill={severity.color} />
        <circle cx="30" cy="20" r="2" fill={severity.color} />
      </svg>
    )
  }
  if (severity.label === 'Nhẹ') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke={severity.color} strokeWidth="2" />
        <path d="M16 28c0 0 2 6 8 6s8-6 8-6" stroke={severity.color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="18" cy="20" r="2" fill={severity.color} />
        <circle cx="30" cy="20" r="2" fill={severity.color} />
      </svg>
    )
  }
  if (severity.label === 'Vừa') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke={severity.color} strokeWidth="2" />
        <path d="M16 30h16" stroke={severity.color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="18" cy="20" r="2" fill={severity.color} />
        <circle cx="30" cy="20" r="2" fill={severity.color} />
      </svg>
    )
  }
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="20" stroke={severity.color} strokeWidth="2" />
      <path d="M16 30h16" stroke={severity.color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="18" cy="20" r="2" fill={severity.color} />
      <circle cx="30" cy="20" r="2" fill={severity.color} />
    </svg>
  )
}

export function TestResultView({
  test,
  score,
  severity,
  onRetake,
  onHistory,
  onBackToList,
}: TestResultProps) {
  const maxScore = test.questions.length * 3

  return (
    <div className="animate-fade-in space-y-8" role="status" aria-live="polite">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface border border-border">
          {getSeverityIcon(severity)}
        </div>

        <h2 className="font-serif text-2xl text-fg-primary">Kết quả của bạn</h2>

        <div className="space-y-1">
          <div className="text-5xl font-serif font-bold" style={{ color: severity.color }}>
            {score}
            <span className="text-2xl text-fg-tertiary font-normal"> / {maxScore}</span>
          </div>
          <div
            className="inline-block rounded-full px-4 py-1 text-sm font-medium"
            style={{
              backgroundColor: `${severity.color}1A`,
              color: severity.color,
            }}
          >
            {severity.label}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-surface border border-border p-5 space-y-3">
        <h3 className="font-medium text-fg-primary text-sm">Đánh giá</h3>
        <p className="text-sm text-fg-secondary leading-relaxed">{severity.description}</p>
      </div>

      <div className="rounded-lg bg-accent-sage-surface border border-accent-sage/20 p-5 space-y-2">
        <h3 className="font-medium text-accent-sage text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 5v4M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Lời khuyên
        </h3>
        <p className="text-sm text-fg-secondary leading-relaxed">{severity.recommendation}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onRetake}
          className="rounded-full bg-accent-sage text-white font-medium py-2.5 px-6 text-sm transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
        >
          Làm lại bài này
        </button>
        <button
          type="button"
          onClick={onHistory}
          className="rounded-full border border-border text-fg-secondary font-medium py-2.5 px-6 text-sm transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
        >
          Xem lịch sử
        </button>
        <button
          type="button"
          onClick={onBackToList}
          className="rounded-full border border-border text-fg-secondary py-2.5 px-6 text-sm transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
        >
          Làm bài khác
        </button>
      </div>
    </div>
  )
}
