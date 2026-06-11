import { useEffect, useCallback } from 'react'
import { TestProgress } from './test-progress'
import type { TestType } from '@/types'

interface TestQuizProps {
  test: TestType
  step: number
  answers: (number | undefined)[]
  onAnswer: (index: number) => void
  onNext: () => void
  onPrev: () => void
  onFinish: () => void
  total: number
}

export function TestQuiz({
  test,
  step,
  answers,
  onAnswer,
  onNext,
  onPrev,
  onFinish,
  total,
}: TestQuizProps) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = parseInt(e.key)
      if (key >= 1 && key <= 4 && key - 1 < test.options.length) {
        e.preventDefault()
        onAnswer(key - 1)
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (step === total - 1) {
          onFinish()
        } else {
          onNext()
        }
      }
    },
    [onAnswer, onNext, onFinish, step, total, test.options.length],
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  const hasAnswer = answers[step] !== undefined

  return (
    <div className="animate-fade-in space-y-8">
      <TestProgress current={step} total={total} />

      <div className="space-y-6">
        <p className="text-sm text-fg-secondary font-medium">
          {test.name}
        </p>

        <h3 className="text-lg font-serif text-fg-primary leading-relaxed">
          {test.questions[step]}
        </h3>

        <div className="space-y-2" role="radiogroup" aria-label="Chọn câu trả lời">
          {test.options.map((opt, idx) => {
            const isSelected = answers[step] === idx
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onAnswer(idx)}
                className={`
                  w-full text-left rounded-xl border px-5 py-3.5 text-sm transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2
                  ${isSelected
                    ? 'bg-accent-sage-surface border-accent-sage text-accent-sage font-medium'
                    : 'bg-surface border-border text-fg-secondary hover:border-accent-sage/50 hover:bg-surface-hover'
                  }
                `}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`
                      inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium
                      ${isSelected
                        ? 'bg-accent-sage text-white'
                        : 'bg-border text-fg-tertiary'
                      }
                    `}
                  >
                    {idx + 1}
                  </span>
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={step === 0}
          className="rounded-full border border-border px-5 py-2.5 text-sm text-fg-secondary transition-colors hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
        >
          Quay lại
        </button>

        <span className="text-xs text-fg-tertiary">
          Phím 1-4 để chọn • Enter để tiếp
        </span>

        {step === total - 1 ? (
          <button
            type="button"
            onClick={onFinish}
            disabled={!hasAnswer}
            className="rounded-full bg-accent-sage text-white font-medium px-6 py-2.5 text-sm transition-colors hover:bg-accent-sage/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
          >
            Xem kết quả
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!hasAnswer}
            className="rounded-full bg-accent-sage text-white font-medium px-6 py-2.5 text-sm transition-colors hover:bg-accent-sage/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
          >
            Tiếp
          </button>
        )}
      </div>
    </div>
  )
}
