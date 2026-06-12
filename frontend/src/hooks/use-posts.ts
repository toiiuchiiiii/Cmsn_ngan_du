import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Post, Comment } from '@/types'
import type { CreatePostFormData, CreateCommentFormData } from '@/lib/post-schemas'

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await api.get('posts').json<{ success: boolean; data: Post[] }>()
      return { posts: res.data }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await api.get(`posts/${id}`).json<{ success: boolean; data: Post }>()
      return res.data
    },
  })
}

export function usePostComments(postId: number) {
  return useQuery({
    queryKey: ['post', postId, 'comments'],
    queryFn: async () => {
      const res = await api.get(`posts/${postId}/comments`).json<{ success: boolean; data: Comment[] }>()
      return { comments: res.data }
    },
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreatePostFormData) => {
      const res = await api.post('posts', { json: data }).json<{ success: boolean; data: Post }>()
      return res.data
    },
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
    mutationFn: async (data: CreateCommentFormData) => {
      const res = await api.post(`posts/${postId}/comments`, { json: data }).json<{ success: boolean; data: Comment }>()
      return res.data
    },
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
