import { create } from 'zustand'
import type { Conversation, Message, Contact } from '@/types'

interface ChatState {
  conversations: Conversation[]
  activeConversationId: number | null
  messages: Map<number, Message[]>
  unreadCount: number
  contacts: Contact[]

  setConversations: (conversations: Conversation[]) => void
  setActiveConversation: (id: number | null) => void
  addMessage: (conversationId: number, message: Message) => void
  incrementUnread: (amount: number) => void
  setMessages: (conversationId: number, messages: Message[]) => void
  markAsRead: (conversationId: number) => void
  setContacts: (contacts: Contact[]) => void
  updateContactStatus: (userId: number, isOnline: boolean) => void
  purge: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: new Map(),
  unreadCount: 0,
  contacts: [],

  setConversations: (conversations) => {
    const unreadCount = conversations.reduce((acc, c) => {
      return acc + (c.last_message && !c.last_message.is_read ? 1 : 0)
    }, 0)
    set({ conversations, unreadCount })
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) =>
    set((state) => {
      const updated = new Map(state.messages)
      const existing = updated.get(conversationId) || []
      if (!existing.some((m) => m.id === message.id)) {
        updated.set(conversationId, [...existing, message])
      }
      return { messages: updated }
    }),

  incrementUnread: (amount) =>
    set((state) => ({ unreadCount: state.unreadCount + amount })),

  setMessages: (conversationId, messages) =>
    set((state) => {
      const updated = new Map(state.messages)
      updated.set(conversationId, messages)
      return { messages: updated }
    }),

  markAsRead: (conversationId) =>
    set((state) => {
      const updated = new Map(state.messages)
      const convMessages = updated.get(conversationId) || []
      updated.set(
        conversationId,
        convMessages.map((m) => ({ ...m, is_read: true })),
      )
      const conversations = state.conversations.map((c) =>
        c.id === conversationId && c.last_message
          ? { ...c, last_message: { ...c.last_message, is_read: true } }
          : c,
      )
      const unreadCount = conversations.reduce((acc, c) => {
        return acc + (c.last_message && !c.last_message.is_read ? 1 : 0)
      }, 0)
      return { messages: updated, conversations, unreadCount }
    }),

  setContacts: (contacts) => set({ contacts }),

  updateContactStatus: (userId, isOnline) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === userId ? { ...c, is_online: isOnline } : c,
      ),
    })),

  purge: () =>
    set({
      conversations: [],
      activeConversationId: null,
      messages: new Map(),
      unreadCount: 0,
      contacts: [],
    }),
}))
