import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { BotReply } from '@/types'
import type { BotChatFormData } from '@/lib/agent-schemas'

export function useBotChat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BotChatFormData) =>
      api.post('bot/chat', { json: data }).json<{ reply: string }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bot', 'replies'] })
    },
  })
}

export function useBotReplies() {
  return useQuery({
    queryKey: ['bot', 'replies'],
    queryFn: () =>
      api.get('bot/replies').json<{ replies: BotReply[] }>(),
    staleTime: 60_000,
  })
}
