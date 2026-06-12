import { useCallback } from 'react'
import { usePosts, useCreatePost, useDeletePost, useLikePost } from '@/hooks/use-posts'
import { PostCreate } from './post-create'
import { PostCard, PostCardSkeleton } from './post-card'
import type { CreatePostFormData } from '@/lib/post-schemas'
import type { Post } from '@/types'

function PostCardItem({ post, onDelete, isDeletePending }: { post: Post; onDelete: (id: number) => void; isDeletePending: boolean }) {
  const likeMutation = useLikePost(post.id)
  return (
    <PostCard
      post={post}
      onLike={() => likeMutation.mutate()}
      onDelete={() => onDelete(post.id)}
      isLikePending={likeMutation.isPending}
      isDeletePending={isDeletePending}
    />
  )
}

export function CommunityPage() {
  const { data, isLoading, isError, error, refetch } = usePosts()
  const createMutation = useCreatePost()
  const deleteMutation = useDeletePost()

  const posts = data?.posts ?? []

  const handleCreate = useCallback(
    async (formData: CreatePostFormData) => {
      await createMutation.mutateAsync(formData)
    },
    [createMutation],
  )

  const handleDelete = useCallback(
    (id: number) => {
      deleteMutation.mutate(id)
    },
    [deleteMutation],
  )

  const renderFeed = () => {
    if (isLoading) {
      return (
        <div className="space-y-3" aria-busy="true" role="status">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <span className="sr-only">Đang tải bài viết...</span>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="rounded-lg bg-crisis-surface border border-crisis/20 px-5 py-4 text-center" role="alert">
          <p className="text-sm text-crisis mb-3">
            {error instanceof Error ? error.message : 'Không thể tải bài viết. Vui lòng thử lại.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-accent-sage text-white text-sm font-medium py-2 px-5 transition-colors hover:bg-accent-sage/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2"
          >
            Thử lại
          </button>
        </div>
      )
    }

    if (posts.length === 0) {
      return (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-6 text-fg-tertiary">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <rect x="10" y="12" width="44" height="44" rx="6" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M24 24h16M24 32h16M24 40h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="48" cy="48" r="14" fill="currentColor" opacity="0.1" />
              <path d="M48 42v12M42 48h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-fg-secondary text-lg mb-2">Chưa có bài viết nào</p>
          <p className="text-fg-tertiary text-sm">Hãy là người đầu tiên chia sẻ!</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCardItem
            key={post.id}
            post={post}
            onDelete={handleDelete}
            isDeletePending={deleteMutation.isPending}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-fg-primary">Cộng đồng</h1>
        <p className="text-fg-secondary text-sm mt-1">
          Chia sẻ và kết nối với những người khác
        </p>
      </header>

      <section aria-labelledby="create-post-heading">
        <h2 id="create-post-heading" className="sr-only">Tạo bài viết mới</h2>
        <PostCreate onSubmit={handleCreate} isLoading={createMutation.isPending} />
      </section>

      <section aria-labelledby="feed-heading" className="space-y-4">
        <h2 id="feed-heading" className="font-serif text-xl text-fg-primary">
          Bài viết gần đây
        </h2>
        <div className="min-h-[100px]">
          {renderFeed()}
        </div>
      </section>
    </div>
  )
}