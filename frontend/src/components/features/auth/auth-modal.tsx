import { useEffect, useRef, useCallback, useState } from 'react'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { useAuthStore } from '@/stores/auth-store'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'register'
}

type Tab = 'login' | 'register'

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab)
  const { isAuthenticated, isLoading } = useAuthStore()
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      onOpenChange(false)
    }
    if (e.key === 'Tab' && open && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }, 100)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previousActiveElement.current?.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (isAuthenticated) {
    return null
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={(e) => {
        if (e.target === overlayRef.current) onOpenChange(false)
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Đăng nhập hoặc đăng ký"
    >
      <div
        ref={modalRef}
        className="bg-canvas rounded-xl w-full max-w-md mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex gap-1 bg-surface rounded-full p-1">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              aria-controls="auth-panel"
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-accent-sage text-white'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'register'}
              aria-controls="auth-panel"
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === 'register'
                  ? 'bg-accent-sage text-white'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
              onClick={() => setActiveTab('register')}
            >
              Đăng ký
            </button>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-fg-tertiary hover:text-fg-primary transition-colors p-1 rounded-full hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
            aria-label="Đóng"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div
          id="auth-panel"
          role="tabpanel"
          aria-labelledby={activeTab === 'login' ? 'login-tab' : 'register-tab'}
          className="px-6 pb-6 pt-4"
        >
          {isLoading ? (
            <div className="space-y-4 animate-pulse" aria-busy="true">
              <div className="h-6 w-40 bg-surface-hover rounded mx-auto" />
              <div className="h-12 bg-surface-hover rounded-xl" />
              <div className="h-12 bg-surface-hover rounded-xl" />
              <div className="h-11 bg-surface-hover rounded-full" />
            </div>
          ) : activeTab === 'login' ? (
            <LoginForm onSuccess={() => onOpenChange(false)} />
          ) : (
            <RegisterForm onSuccess={() => onOpenChange(false)} />
          )}
        </div>
      </div>
    </div>
  )
}
