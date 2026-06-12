import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useSaveTest } from '@/hooks/use-tests'
import { TEST_TYPES } from './test-data'
import { TestIntro } from './test-intro'
import { TestQuiz } from './test-quiz'
import { TestResultView } from './test-result'
import { TestHistory } from './test-history'
import { TestManagement } from './test-management'
import type { TestType, SeverityLevel } from '@/types'

type View = 'select' | 'intro' | 'quiz' | 'result' | 'history'

function findSeverity(test: TestType, score: number): SeverityLevel {
  const sorted = [...test.severityLevels].sort((a, b) => a.min - b.min)
  for (const level of sorted) {
    if (score >= level.min && score <= level.max) {
      return level
    }
  }
  return sorted[sorted.length - 1]
}

export function TestPage() {
  const { isAuthenticated, user } = useAuthStore()
  const saveMutation = useSaveTest()
  const role = user?.role ?? 'patient'
  const canManage = role === 'therapist' || role === 'admin'

  const [pageTab, setPageTab] = useState<'test' | 'manage'>('test')
  const [view, setView] = useState<View>('select')
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(number | undefined)[]>([])
  const [score, setScore] = useState(0)
  const [severity, setSeverity] = useState<SeverityLevel | null>(null)

  const handleSelectTest = useCallback((test: TestType) => {
    setSelectedTest(test)
    setStep(0)
    setAnswers([])
    setScore(0)
    setSeverity(null)
    setView('intro')
  }, [])

  const handleStart = useCallback(() => {
    if (selectedTest) {
      setAnswers(new Array(selectedTest.questions.length).fill(undefined))
      setView('quiz')
    }
  }, [selectedTest])

  const handleAnswer = useCallback(
    (index: number) => {
      setAnswers((prev) => {
        const next = [...prev]
        next[step] = index
        return next
      })
    },
    [step],
  )

  const handleNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, (selectedTest?.questions.length ?? 1) - 1))
  }, [selectedTest])

  const handlePrev = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const handleFinish = useCallback(() => {
    if (!selectedTest) return
    const total: number = answers.reduce(
      (sum: number, a) => sum + (a !== undefined ? selectedTest.options[a].value : 0),
      0,
    )
    const sev = findSeverity(selectedTest, total)
    setScore(total)
    setSeverity(sev)
    setView('result')

    if (isAuthenticated) {
      saveMutation.mutate({
        test_type: selectedTest.id,
        score: total,
        severity: sev.label,
        result: sev.description,
        answers: answers as number[],
      })
    }
  }, [selectedTest, answers, isAuthenticated, saveMutation])

  const handleRetake = useCallback(() => {
    if (selectedTest) {
      setStep(0)
      setAnswers(new Array(selectedTest.questions.length).fill(undefined))
      setScore(0)
      setSeverity(null)
      setView('quiz')
    }
  }, [selectedTest])

  const handleBackToList = useCallback(() => {
    setSelectedTest(null)
    setView('select')
  }, [])

  const handleViewHistory = useCallback(() => {
    setView('history')
  }, [])

  const renderView = () => {
    switch (view) {
      case 'intro':
        return selectedTest ? (
          <TestIntro test={selectedTest} onStart={handleStart} onBack={handleBackToList} />
        ) : null

      case 'quiz':
        return selectedTest ? (
          <TestQuiz
            test={selectedTest}
            step={step}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            onFinish={handleFinish}
            total={selectedTest.questions.length}
          />
        ) : null

      case 'result':
        return selectedTest && severity ? (
          <TestResultView
            test={selectedTest}
            score={score}
            severity={severity}
            onRetake={handleRetake}
            onHistory={handleViewHistory}
            onBackToList={handleBackToList}
          />
        ) : null

      case 'history':
        return (
          <TestHistory
            testTypes={TEST_TYPES}
            onViewResult={(testResult) => {
              const test = TEST_TYPES.find((t) => t.id === testResult.test_type)
              if (test) {
                setSelectedTest(test)
                setScore(testResult.score)
                setSeverity(findSeverity(test, testResult.score))
                setView('result')
              }
            }}
            onBack={handleBackToList}
          />
        )

      default:
        return renderTestSelect()
    }
  }

  const renderTestSelect = () => (
    <div className="animate-fade-in space-y-6">
      <header className="text-center space-y-3">
        <span className="inline-block rounded-full bg-accent-sage-surface px-4 py-1 text-sm text-accent-sage font-medium">
          Sức khỏe tâm thần
        </span>
        <h1 className="font-serif text-3xl text-fg-primary">Chọn bài kiểm tra</h1>
        <p className="text-fg-secondary max-w-md mx-auto">
          Các bài kiểm tra dưới đây giúp bạn hiểu hơn về tình trạng sức khỏe tinh thần hiện tại.
        </p>
      </header>

      <div className="grid gap-4 max-w-lg mx-auto">
        {TEST_TYPES.map((test) => (
          <button
            key={test.id}
            type="button"
            onClick={() => handleSelectTest(test)}
            className="w-full text-left rounded-lg bg-surface border border-border p-5 transition-colors hover:border-accent-sage/50 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-accent-sage-surface flex items-center justify-center text-accent-sage">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-fg-primary">{test.name}</h3>
                <p className="text-sm text-fg-secondary mt-1 line-clamp-2">{test.description}</p>
                <span className="inline-block text-xs text-fg-tertiary mt-2">
                  {test.questions.length} câu hỏi • {test.time}
                </span>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-fg-tertiary shrink-0 mt-2" aria-hidden="true">
                <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      {canManage && (
        <div className="flex gap-2 mb-8 justify-center">
          <button
            type="button"
            onClick={() => setPageTab('test')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${pageTab === 'test' ? 'bg-accent-sage text-white' : 'border border-border text-fg-secondary hover:bg-surface-hover'}`}
          >
            Bài kiểm tra
          </button>
          <button
            type="button"
            onClick={() => setPageTab('manage')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${pageTab === 'manage' ? 'bg-accent-sage text-white' : 'border border-border text-fg-secondary hover:bg-surface-hover'}`}
          >
            Quản lý
          </button>
        </div>
      )}
      {pageTab === 'manage' && canManage ? <TestManagement /> : renderView()}
    </div>
  )
}
