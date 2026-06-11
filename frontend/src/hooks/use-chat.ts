import { useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useChatStore } from '@/stores/chat-store'
import type { Conversation, Message, Contact } from '@/types'
import type { SendMessageFormData } from '@/lib/chat-schemas'

export function useConversations() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () =>
      api.get('chat/conversations').json<{ conversations: Conversation[] }>(),
    staleTime: 0,
  })
}

export function useMessages(convId: number | null) {
  const lastMsgId = useRef(0)
  const { setMessages } = useChatStore()

  const query = useQuery({
    queryKey: ['chat', 'messages', convId],
    queryFn: async () => {
      const data = await api
        .get(`chat/conversations/${convId}/messages?after=${lastMsgId.current}`)
        .json<{ messages: Message[] }>()
      return data
    },
    enabled: !!convId,
    refetchInterval: convId ? 3000 : false,
    staleTime: 0,
  })

  useEffect(() => {
    if (query.data?.messages && convId) {
      if (query.data.messages.length > 0) {
        lastMsgId.current = Math.max(
          ...query.data.messages.map((m) => m.id),
        )
      }
      setMessages(convId, query.data.messages)
    }
  }, [query.data, convId, setMessages])

  return query
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SendMessageFormData & { conversation_id: number }) =>
      api
        .post(`chat/conversations/${data.conversation_id}/messages`, {
          json: { text: data.text },
        })
        .json<Message>(),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: ['chat', 'messages', variables.conversation_id],
      })
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { contact_id: number }) =>
      api.post('chat/conversations', { json: data }).json<Conversation>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

export function useContacts() {
  return useQuery({
    queryKey: ['chat', 'contacts'],
    queryFn: () => api.get('chat/contacts').json<{ contacts: Contact[] }>(),
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
