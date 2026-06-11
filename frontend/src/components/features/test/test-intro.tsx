import type { TestType } from '@/types'

interface TestIntroProps {
  test: TestType
  onStart: () => void
  onBack: () => void
}

export function TestIntro({ test, onStart, onBack }: TestIntroProps) {
  return (
    <div className="animate-fade-in space-y-6" role="status">
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

      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-sage-surface text-accent-sage">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
            <path d="M16 10v6M16 22v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="font-serif text-2xl text-fg-primary">{test.name}</h2>
        <p className="text-fg-secondary max-w-md mx-auto">{test.description}</p>

        <div className="inline-flex items-center gap-2 rounded-full bg-surface border border-border px-4 py-2 text-sm text-fg-secondary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Thời gian: {test.time}
          <span className="mx-1 text-fg-disabled">•</span>
          {test.questions.length} câu hỏi
        </div>
      </div>

      <div className="rounded-lg bg-surface border border-border p-5 space-y-2">
        <h3 className="font-medium text-fg-primary text-sm">Hướng dẫn:</h3>
        <ul className="text-sm text-fg-secondary space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-accent-sage mt-0.5">•</span>
            Trả lời dựa trên tình trạng của bạn trong 2 tuần qua
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-sage mt-0.5">•</span>
            Chọn câu trả lời phù hợp nhất, không cần suy nghĩ quá lâu
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent-sage mt-0.5">•</span>
            Kết quả chỉ mang tính tham khảo, không thay thế chẩn đoán y tế
          </li>
        </ul>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-accent-sage text-white font-medium py-3 px-10 text-base transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
        >
          Bắt đầu
        </button>
      </div>
    </div>
  )
}
