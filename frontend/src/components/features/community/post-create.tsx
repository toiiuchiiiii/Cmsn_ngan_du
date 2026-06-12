import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/stores/auth-store'
import { createPostSchema, type CreatePostFormData } from '@/lib/post-schemas'

interface PostCreateProps {
  onSubmit: (data: CreatePostFormData) => Promise<void>
  isLoading?: boolean
}

export function PostCreate({ onSubmit, isLoading }: PostCreateProps) {
  const { isAuthenticated } = useAuthStore()
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: '', content: '', isAnonymous: false },
  })

  const handleFormSubmit = async (data: CreatePostFormData) => {
    await onSubmit({
      ...data,
      guestName: isAuthenticated ? undefined : guestName,
      guestEmail: isAuthenticated ? undefined : guestEmail,
    })
    reset()
    if (!isAuthenticated) { setGuestName(''); setGuestEmail('') }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="rounded-lg bg-surface border border-border p-5 space-y-4">
        <h2 className="font-serif text-lg text-fg-primary">Tạo bài viết mới</h2>

        {!isAuthenticated && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-fg-secondary mb-1.5">Tên của bạn</label>
              <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} required placeholder="Nhập tên..."
                className="w-full rounded-lg bg-canvas border border-border px-4 py-2.5 text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent-sage" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-fg-secondary mb-1.5">Email</label>
              <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required placeholder="Email..."
                className="w-full rounded-lg bg-canvas border border-border px-4 py-2.5 text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent-sage" />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="post-title" className="block text-sm font-medium text-fg-secondary mb-1.5">
            Tiêu đề
          </label>
          <input
            id="post-title"
            type="text"
            placeholder="Tiêu đề bài viết..."
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'post-title-error' : undefined}
            className="w-full rounded-lg bg-canvas border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors"
            {...register('title')}
          />
          {errors.title && (
            <p id="post-title-error" className="mt-1 text-sm text-crisis" role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="post-content" className="block text-sm font-medium text-fg-secondary mb-1.5">
            Nội dung
          </label>
          <textarea
            id="post-content"
            placeholder="Chia sẻ suy nghĩ của bạn..."
            aria-required="true"
            aria-invalid={!!errors.content}
            aria-describedby={errors.content ? 'post-content-error' : undefined}
            rows={4}
            className="w-full rounded-lg bg-canvas border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors resize-none"
            {...register('content')}
          />
          {errors.content && (
            <p id="post-content-error" className="mt-1 text-sm text-crisis" role="alert">
              {errors.content.message}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-border text-accent-sage focus:ring-accent-sage cursor-pointer"
            {...register('isAnonymous')}
          />
          <span className="text-sm text-fg-secondary">Đăng ẩn danh</span>
        </label>

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
              Đang đăng...
            </span>
          ) : (
            'Đăng bài'
          )}
        </button>
      </div>
    </form>
  )
}
