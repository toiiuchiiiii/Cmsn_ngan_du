import { Link } from 'react-router-dom'
import type { Post } from '@/types'
import { PostActions } from './post-actions'

interface PostCardProps {
  post: Post
  onLike: () => void
  onDelete: () => void
  isLikePending?: boolean
  isDeletePending?: boolean
}

export function PostCard({ post, onLike, onDelete, isLikePending, isDeletePending }: PostCardProps) {
  const date = new Date(post.created_at).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="rounded-lg bg-surface border border-border p-5 transition-colors hover:border-border-hover">
      <div className="flex items-start justify-between gap-3 mb-2">
        <Link
          to={`/community/${post.id}`}
          className="flex-1 min-w-0 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage rounded"
        >
          <h3 className="font-serif text-lg text-fg-primary mb-1 leading-snug">
            {post.title}
          </h3>
          <p className="text-sm text-fg-secondary leading-relaxed line-clamp-3">
            {post.content}
          </p>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 mt-3">
        <div className="flex items-center gap-2 text-xs text-fg-tertiary">
          <span>{post.is_anonymous ? 'Ẩn danh' : (post.author?.name ?? 'Người dùng')}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.created_at}>{date}</time>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/community/${post.id}`}
            className="flex items-center gap-1 text-sm text-fg-tertiary hover:text-accent-sage transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage rounded"
            aria-label={`${post.comment_count} bình luận`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <span>{post.comment_count}</span>
          </Link>

          <PostActions
            postId={post.id}
            userId={post.user_id}
            likeCount={post.like_count}
            onLike={onLike}
            onDelete={onDelete}
            isLikePending={isLikePending}
            isDeletePending={isDeletePending}
          />
        </div>
      </div>
    </article>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-lg bg-surface border border-border p-5 space-y-3 animate-pulse" aria-busy="true" role="status">
      <div className="h-5 bg-surface-hover rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-surface-hover rounded w-full" />
        <div className="h-3 bg-surface-hover rounded w-5/6" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 bg-surface-hover rounded w-20" />
        <div className="h-3 bg-surface-hover rounded w-24" />
      </div>
      <span className="sr-only">Đang tải bài viết...</span>
    </div>
  )
}
