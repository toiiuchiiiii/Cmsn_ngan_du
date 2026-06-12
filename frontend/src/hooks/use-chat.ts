import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useChatStore } from '@/stores/chat-store'
import type { Conversation, Message, User } from '@/types'
import type { SendMessageFormData } from '@/lib/chat-schemas'

interface BackendConversation {
  conversation: {
    id: number
    created_at: string
    updated_at: string
  }
  lastMessage: {
    id: number
    conversation_id: number
    sender_id: number
    text: string
    is_read: number
    created_at: string
  } | null
  participantIds: number[]
}

function toConversation(raw: BackendConversation): Conversation {
  return {
    id: raw.conversation.id,
    created_at: raw.conversation.created_at,
    updated_at: raw.conversation.updated_at,
    participants: [],
    last_message: raw.lastMessage
      ? { ...raw.lastMessage, is_read: !!raw.lastMessage.is_read }
      : undefined,
  }
}

export function useConversations() {
  const setConversations = useChatStore((s) => s.setConversations)

  const query = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: async () => {
      const res = await api.get('chat/conversations').json<{ success: boolean; data: BackendConversation[] }>()
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
      const res = await api.get(`chat/conversations/${convId}/messages`).json<{ success: boolean; data: Message[] }>()
      return res.data
    },
    enabled: !!convId,
    refetchInterval: convId ? 3000 : false,
    staleTime: 0,
  })

  useEffect(() => {
    if (query.data && convId) {
      setMessages(convId, query.data)
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
        .json<{ success: boolean; data: Message }>()
      return res.data
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
      const res = await api.post('chat/conversations', { json: data }).json<{ success: boolean; data: Conversation }>()
      return res.data
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
