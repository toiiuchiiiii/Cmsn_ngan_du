import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEntrySchema, type CreateEntryFormData, type Mood } from '@/lib/diary-schemas'
import { MoodSelector } from './mood-selector'

interface EntryCreateProps {
  onSubmit: (data: CreateEntryFormData) => Promise<void>
  isLoading?: boolean
}

export function EntryCreate({ onSubmit, isLoading }: EntryCreateProps) {
  const [tagsInput, setTagsInput] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createEntrySchema),
    defaultValues: { content: '', mood: undefined, tags: [] },
  })

  const selectedMood = watch('mood') as Mood | undefined

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data as CreateEntryFormData)
    reset()
    setTagsInput('')
  }

  const handleTagsBlur = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    setValue('tags', tags)
  }

  const handleMoodChange = (mood: Mood) => {
    setValue('mood', mood, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      <div>
        <label className="block text-sm font-medium text-fg-secondary mb-2">
          Hôm nay bạn thế nào?
        </label>
        <MoodSelector
          value={selectedMood ?? null}
          onChange={handleMoodChange}
        />
        {errors.mood && (
          <p className="mt-1 text-sm text-crisis" role="alert">{errors.mood.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="entry-content" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Chia sẻ cảm xúc của bạn
        </label>
        <textarea
          id="entry-content"
          placeholder="Hôm nay của bạn thế nào?..."
          aria-required="true"
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? 'entry-content-error' : undefined}
          rows={4}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors resize-none"
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
          }}
          {...register('content')}
        />
        {errors.content && (
          <p id="entry-content-error" className="mt-1 text-sm text-crisis" role="alert">
            {errors.content.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="entry-tags" className="block text-sm font-medium text-fg-secondary mb-1.5">
          Thẻ (phân cách bằng dấu phẩy)
        </label>
        <input
          id="entry-tags"
          type="text"
          placeholder="ví dụ: gia đình, bạn bè, học tập"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          onBlur={handleTagsBlur}
          className="w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors"
        />
      </div>

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
            Đang lưu...
          </span>
        ) : (
          'Lưu nhật ký'
        )}
      </button>
    </form>
  )
}
