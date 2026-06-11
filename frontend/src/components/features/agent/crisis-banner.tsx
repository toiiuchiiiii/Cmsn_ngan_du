import { useAgentStore } from '@/stores/agent-store'

export function CrisisBanner() {
  const { showCrisisBanner, dismissCrisisBanner } = useAgentStore()

  if (!showCrisisBanner) return null

  return (
    <div
      className="sticky top-0 z-30 w-full bg-crisis-surface border-b border-crisis/20 animate-slide-up"
      role="alert"
    >
      <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-crisis text-lg" aria-hidden="true">⚠️</span>
          <p className="text-sm text-crisis font-medium leading-snug">
            Bạn đang gặp khủng hoảng?{' '}
            <a
              href="tel:19001234"
              className="underline font-semibold hover:no-underline transition-colors"
            >
              Nhấn vào đây
            </a>
            {' '}để được hỗ trợ ngay lập tức.
          </p>
        </div>
        <button
          type="button"
          onClick={dismissCrisisBanner}
          aria-label="Đóng thông báo"
          className="flex-shrink-0 rounded-full p-1 text-crisis/70 hover:text-crisis hover:bg-crisis/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crisis"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
