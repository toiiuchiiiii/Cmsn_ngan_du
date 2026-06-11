import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePost, usePostComments, useCreateComment, useDeletePost } from '@/hooks/use-posts'
import { useLikePost } from '@/hooks/use-posts'
import { createCommentSchema, type CreateCommentFormData } from '@/lib/post-schemas'
import { useAuthStore } from '@/stores/auth-store'
import { PostActions } from './post-actions'
import { CommentCard } from './comment-card'


export function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const postId = Number(id)
  const { isAuthenticated } = useAuthStore()

  const { data: post, isLoading, isError, error } = usePost(postId)
  const { data: commentsData, isLoading: commentsLoading, isError: commentsError } = usePostComments(postId)
  const createCommentMutation = useCreateComment(postId)
  const deletePostMutation = useDeletePost()
  const likeMutation = useLikePost(postId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { content: '' },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-4 animate-pulse" aria-busy="true" role="status">
          <div className="h-8 bg-surface-hover rounded w-3/4" />
          <div className="h-4 bg-surface-hover rounded w-1/3" />
          <div className="space-y-2 mt-6">
            <div className="h-4 bg-surface-hover rounded w-full" />
            <div className="h-4 bg-surface-hover rounded w-full" />
            <div className="h-4 bg-surface-hover rounded w-5/6" />
          </div>
          <span className="sr-only">Đang tải bài viết...</span>
        </div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="mb-4 text-fg-tertiary">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M24 24l16 16M40 24l-16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-fg-primary mb-2">Không tìm thấy bài viết</h1>
        <p className="text-fg-secondary text-sm mb-6">
          {error instanceof Error ? error.message : 'Bài viết không tồn tại hoặc đã bị xoá.'}
        </p>
        <Link
          to="/community"
          className="inline-block rounded-full bg-accent-sage text-white text-sm font-medium py-2 px-5 transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2 no-underline"
        >
          Quay lại diễn đàn
        </Link>
      </main>
    )
  }

  const date = new Date(post.created_at).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleCommentSubmit = async (data: CreateCommentFormData) => {
    await createCommentMutation.mutateAsync(data)
    reset()
  }

  const handleLike = () => {
    likeMutation.mutate()
  }

  const handleDelete = () => {
    deletePostMutation.mutate(post.id)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Link
        to="/community"
        className="inline-flex items-center gap-1.5 text-sm text-fg-tertiary hover:text-accent-sage transition-colors mb-6 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage rounded"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Quay lại diễn đàn
      </Link>

      <article>
        <div className="rounded-lg bg-surface border border-border p-6">
          <h1 className="font-serif text-2xl text-fg-primary mb-2 leading-snug">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-fg-tertiary mb-5">
            <span>{post.is_anonymous ? 'Ẩn danh' : (post.author?.name ?? 'Người dùng')}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.created_at}>{date}</time>
          </div>

          <p className="text-sm text-fg-secondary leading-relaxed whitespace-pre-wrap mb-5">
            {post.content}
          </p>

          <PostActions
            postId={post.id}
            userId={post.user_id}
            likeCount={post.like_count}
            onLike={handleLike}
            onDelete={handleDelete}
            isLikePending={likeMutation.isPending}
            isDeletePending={deletePostMutation.isPending}
          />
        </div>
      </article>

      <section className="mt-8" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="font-serif text-xl text-fg-primary mb-5">
          Bình luận ({commentsData?.comments?.length ?? 0})
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleSubmit(handleCommentSubmit)} noValidate className="mb-6">
            <div className="rounded-lg bg-surface border border-border p-4 space-y-3">
              <div>
                <label htmlFor="comment-content" className="sr-only">
                  Nội dung bình luận
                </label>
                <textarea
                  id="comment-content"
                  placeholder="Viết bình luận..."
                  aria-required="true"
                  aria-invalid={!!errors.content}
                  aria-describedby={errors.content ? 'comment-content-error' : undefined}
                  rows={3}
                  className="w-full rounded-lg bg-canvas border border-border px-4 py-2.5 text-fg-primary placeholder:text-fg-disabled focus:outline-none focus:ring-2 focus:ring-accent-sage focus:border-accent-sage transition-colors resize-none"
                  {...register('content')}
                />
                {errors.content && (
                  <p id="comment-content-error" className="mt-1 text-sm text-crisis" role="alert">
                    {errors.content.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={createCommentMutation.isPending}
                className="rounded-full bg-accent-sage text-white text-sm font-medium py-2 px-5 transition-colors hover:bg-accent-sage/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
              >
                {createCommentMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </form>
        )}

        {commentsLoading && (
          <div className="space-y-3 animate-pulse" aria-busy="true" role="status">
            <div className="h-16 bg-surface-hover rounded-lg" />
            <div className="h-16 bg-surface-hover rounded-lg" />
            <span className="sr-only">Đang tải bình luận...</span>
          </div>
        )}

        {commentsError && (
          <div className="rounded-lg bg-crisis-surface border border-crisis/20 px-5 py-4 text-center" role="alert">
            <p className="text-sm text-crisis">Không thể tải bình luận.</p>
          </div>
        )}

        {!commentsLoading && !commentsError && commentsData?.comments?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-fg-tertiary text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        )}

        {!commentsLoading && !commentsError && commentsData && (
          <div className="rounded-lg bg-surface border border-border p-4">
            {commentsData.comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onDelete={(_commentId) => {
                  // deleteComment mutation would go here when API supports it
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
