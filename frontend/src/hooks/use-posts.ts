import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Post, Comment } from '@/types'
import type { CreatePostFormData, CreateCommentFormData } from '@/lib/post-schemas'

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => api.get('posts').json<{ posts: Post[] }>(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get(`posts/${id}`).json<Post>(),
  })
}

export function usePostComments(postId: number) {
  return useQuery({
    queryKey: ['post', postId, 'comments'],
    queryFn: () => api.get(`posts/${postId}/comments`).json<{ comments: Comment[] }>(),
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePostFormData) =>
      api.post('posts', { json: data }).json<Post>(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`posts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function useCreateComment(postId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCommentFormData) =>
      api.post(`posts/${postId}/comments`, { json: data }).json<Comment>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post', postId] })
      qc.invalidateQueries({ queryKey: ['post', postId, 'comments'] })
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}

export function useLikePost(postId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`posts/${postId}/like`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post', postId] })
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
