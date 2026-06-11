import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from './auth-schemas'
import { useAuthStore } from '@/stores/auth-store'
import { useState } from 'react'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuthStore()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    setSubmitError(null)
    try {
      await login(data.email, data.password)
      onSuccess?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <h3 className="text-xl font-serif text-fg-primary text-center">
        Chào mừng trở lại
      </h3>

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          placeholder="email@của bạn.com"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          {...register('email')}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors"
        />
        {errors.email && (
          <p id="login-email-error" className="mt-1 text-sm text-crisis" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Mật khẩu
        </label>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          aria-required="true"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'login-password-error' : undefined}
          {...register('password')}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors"
        />
        {errors.password && (
          <p id="login-password-error" className="mt-1 text-sm text-crisis" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {(submitError || error) && (
        <div
          className="rounded-lg bg-crisis-surface border border-crisis/20 px-4 py-3 text-sm text-crisis"
          role="alert"
          aria-live="polite"
        >
          {submitError || error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-full bg-accent-sage text-white font-medium py-2.5 px-6 transition-colors hover:bg-accent-sage/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Đang đăng nhập...
          </span>
        ) : (
          'Đăng nhập'
        )}
      </button>
    </form>
  )
}
