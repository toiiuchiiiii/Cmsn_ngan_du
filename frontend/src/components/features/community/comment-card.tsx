import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import type { Comment } from '@/types'

interface CommentCardProps {
  comment: Comment
  onDelete: (id: number) => void
  isDeletePending?: boolean
}

export function CommentCard({ comment, onDelete, isDeletePending }: CommentCardProps) {
  const [confirming, setConfirming] = useState(false)
  const { user } = useAuthStore()
  const isOwner = user?.id === comment.user_id
  const date = new Date(comment.created_at).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="py-3 first:pt-0 last:pb-0 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-fg-primary">
              {comment.author?.name ?? 'Ẩn danh'}
            </span>
            <time className="text-xs text-fg-tertiary" dateTime={comment.created_at}>
              {date}
            </time>
          </div>
          <p className="text-sm text-fg-secondary leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {isOwner && (
          <div className="shrink-0">
            {confirming ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { onDelete(comment.id); setConfirming(false) }}
                  disabled={isDeletePending}
                  className="text-xs rounded-full bg-crisis text-white px-2.5 py-1 transition-colors hover:bg-crisis/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crisis"
                >
                  Xoá
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="text-xs rounded-full border border-border px-2.5 py-1 text-fg-secondary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
                >
                  Huỷ
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-fg-tertiary hover:text-crisis transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage"
                aria-label="Xóa bình luận"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
