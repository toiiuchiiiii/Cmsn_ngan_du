import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useChatStore } from '@/stores/chat-store'
import type { Conversation, Message, User } from '@/types'
import type { SendMessageFormData } from '@/lib/chat-schemas'

function toMsg(m: any): Message {
  return {
    id: m.id,
    conversation_id: m.conversationId ?? m.conversation_id,
    sender_id: m.senderId ?? m.sender_id,
    text: m.text,
    is_read: !!(m.isRead ?? m.is_read),
    created_at: m.createdAt ?? m.created_at,
  }
}

interface BackendConv {
  conversation: { id: number; createdAt: string; updatedAt: string }
  lastMessage: any
  participants: { id: number; name: string; email: string; role: string; avatarUrl: string | null }[]
}

function toConversation(raw: BackendConv): Conversation {
  const conv = raw.conversation
  return {
    id: conv.id,
    created_at: conv.createdAt,
    updated_at: conv.updatedAt,
    participants: raw.participants,
    last_message: raw.lastMessage ? toMsg(raw.lastMessage) : undefined,
  }
}

export function useConversations() {
  const setConversations = useChatStore((s) => s.setConversations)

  const query = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: async () => {
      const res = await api.get('chat/conversations').json<{ success: boolean; data: BackendConv[] }>()
      return res.data
    },
    staleTime: 0,
  })

  useEffect(() => {
    if (query.data) {
      const convs = query.data.map(toConversation)
      setConversations(convs)
    }
  }, [query.data, setConversations])

  return query
}

export function useMessages(convId: number | null) {
  const { setMessages } = useChatStore()

  const query = useQuery({
    queryKey: ['chat', 'messages', convId],
    queryFn: async () => {
      const res = await api.get(`chat/conversations/${convId}/messages`).json<{ success: boolean; data: any[] }>()
      return (res.data ?? []).map(toMsg)
    },
    enabled: !!convId,
    refetchInterval: convId ? 3000 : false,
    staleTime: 0,
  })

  useEffect(() => {
    if (query.data && convId) {
      setMessages(convId, [...query.data].reverse())
    }
  }, [query.data, convId, setMessages])

  return query
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: SendMessageFormData & { conversation_id: number }) => {
      const res = await api
        .post(`chat/conversations/${data.conversation_id}/messages`, {
          json: { text: data.text },
        })
        .json<{ success: boolean; data: any }>()
      return toMsg(res.data)
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['chat', 'messages', variables.conversation_id] })
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { contactId: number }) => {
      const res = await api.post('chat/conversations', { json: data }).json<{ success: boolean; data: any }>()
      return toConversation(res.data as BackendConv) as any as Conversation
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

export function useTherapists() {
  return useQuery({
    queryKey: ['chat', 'therapists'],
    queryFn: async () => {
      const res = await api.get('chat/therapists').json<{ success: boolean; data: User[] }>()
      return res.data
    },
    staleTime: 30_000,
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  const { markAsRead } = useChatStore()
  return useMutation({
    mutationFn: (convId: number) =>
      api.post(`chat/conversations/${convId}/read`),
    onSuccess: (_data, convId) => {
      markAsRead(convId)
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}
