import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useChatStore } from '@/stores/chat-store'
import { socketManager } from '@/lib/socket'
import type { Message } from '@/types'

const TYPING_TIMEOUT = 3000

export function useWebSocket() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addMessage = useChatStore((s) => s.addMessage)
  const updateContactStatus = useChatStore((s) => s.updateContactStatus)
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const typingTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  )
  const typingCallbacks = useRef<Set<(convId: number, userId: number) => void>>(
    new Set(),
  )

  const onTyping = useCallback((cb: (convId: number, userId: number) => void) => {
    typingCallbacks.current.add(cb)
    return () => {
      typingCallbacks.current.delete(cb)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      socketManager.disconnect()
      return
    }

    socketManager.connect()

    const joinConversationRoom = (convId: number) => {
      socketManager.send('room.join', { channel: `conversation:${convId}` })
    }

    const unsubConnected = socketManager.subscribe(
      'connected',
      () => {
        socketManager.send('room.join', { channel: 'presence:global' })
        if (activeConversationId) {
          joinConversationRoom(activeConversationId)
        }
      },
    )

    const unsubMessage = socketManager.subscribe(
      'message.new',
      (payload) => {
        const msg = payload as Message
        addMessage(msg.conversation_id, msg)
      },
    )

    const unsubTyping = socketManager.subscribe(
      'typing.start',
      (payload) => {
        const data = payload as {
          conversationId: number
          userId: number
        }
        const { conversationId: conversation_id, userId: user_id } = data
        const existing = typingTimers.current.get(conversation_id)
        if (existing) clearTimeout(existing)
        typingTimers.current.set(
          conversation_id,
          setTimeout(() => {
            typingTimers.current.delete(conversation_id)
          }, TYPING_TIMEOUT),
        )
        typingCallbacks.current.forEach((cb) =>
          cb(conversation_id, user_id),
        )
      },
    )

    const unsubPresence = socketManager.subscribe(
      'presence.update',
      (payload) => {
        const data = payload as {
          userId: number
          status: string
        }
        const { userId: user_id, status } = data
        updateContactStatus(user_id, status === 'online')
      },
    )

    // Join conversation room when active conversation changes
    if (activeConversationId) {
      joinConversationRoom(activeConversationId)
    }

    return () => {
      unsubConnected()
      unsubMessage()
      unsubTyping()
      unsubPresence()
      typingTimers.current.forEach((t) => clearTimeout(t))
      typingTimers.current.clear()
      socketManager.disconnect()
    }
  }, [isAuthenticated, addMessage, updateContactStatus, activeConversationId])

  return { onTyping }
}
