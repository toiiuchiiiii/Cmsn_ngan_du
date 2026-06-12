import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'

interface PostActionsProps {
  postId: number
  userId: number | null
  likeCount: number
  isLiked?: boolean
  onLike: () => void
  onDelete: () => void
  isLikePending?: boolean
  isDeletePending?: boolean
}

export function PostActions({
  postId: _postId,
  userId,
  likeCount,
  isLiked,
  onLike,
  onDelete,
  isLikePending,
  isDeletePending,
}: PostActionsProps) {
  const [confirming, setConfirming] = useState(false)
  const { user } = useAuthStore()
  const isOwner = !!(user?.id && userId && user.id === userId)

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onLike}
        disabled={isLikePending}
        className="flex items-center gap-1.5 text-sm text-fg-tertiary hover:text-accent-sage transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage rounded"
        aria-label={isLiked ? 'Bỏ thích' : 'Thích'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 22V11M2 13v7a2 2 0 002 2h12.4a2 2 0 001.98-1.72l1.2-7A2 2 0 0017.6 11H14V5a3 3 0 00-3-3l-1.2 5.1A2 2 0 007.8 9H4a2 2 0 00-2 2z" />
        </svg>
        <span>{likeCount}</span>
      </button>

      {isOwner && (
        <div className="relative">
          {confirming ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { onDelete(); setConfirming(false) }}
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
              aria-label="Xóa bài viết"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
