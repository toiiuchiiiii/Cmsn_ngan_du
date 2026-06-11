import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from './auth-schemas'
import { useAuthStore } from '@/stores/auth-store'
import { useState, useMemo } from 'react'

interface RegisterFormProps {
  onSuccess?: () => void
}

function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])

  if (!password) return null

  const labels = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Tốt', 'Rất tốt']
  const colors = [
    'bg-crisis',
    'bg-crisis',
    'bg-warning',
    'bg-warning',
    'bg-success',
    'bg-success',
  ]

  return (
    <div className="mt-1.5" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="mt-0.5 text-xs text-fg-tertiary">{labels[strength - 1] || 'Rất yếu'}</p>
    </div>
  )
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const watchedPassword = watch('password', '')

  const onSubmit = async (data: RegisterFormData) => {
    clearError()
    setSubmitError(null)
    try {
      await registerUser(data.name, data.email, data.password)
      onSuccess?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <h3 className="text-xl font-serif text-fg-primary text-center">
        Tạo tài khoản
      </h3>

      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Họ và tên
        </label>
        <input
          id="register-name"
          type="text"
          placeholder="Tên của bạn"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'register-name-error' : undefined}
          {...register('name')}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors"
        />
        {errors.name && (
          <p id="register-name-error" className="mt-1 text-sm text-crisis" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          placeholder="email@của bạn.com"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          {...register('email')}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors"
        />
        {errors.email && (
          <p id="register-email-error" className="mt-1 text-sm text-crisis" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Mật khẩu
        </label>
        <input
          id="register-password"
          type="password"
          placeholder="Ít nhất 8 ký tự"
          aria-required="true"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'register-password-error' : undefined}
          {...register('password')}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors"
        />
        <PasswordStrength password={watchedPassword} />
        {errors.password && (
          <p id="register-password-error" className="mt-1 text-sm text-crisis" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-confirm-password" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Xác nhận mật khẩu
        </label>
        <input
          id="register-confirm-password"
          type="password"
          placeholder="Nhập lại mật khẩu"
          aria-required="true"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined}
          {...register('confirmPassword')}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors"
        />
        {errors.confirmPassword && (
          <p id="register-confirm-password-error" className="mt-1 text-sm text-crisis" role="alert">
            {errors.confirmPassword.message}
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
            Đang đăng ký...
          </span>
        ) : (
          'Đăng ký'
        )}
      </button>
    </form>
  )
}
