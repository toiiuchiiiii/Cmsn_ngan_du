import { create } from 'zustand'
import type { AgentMessage, QuickAction } from '@/types'

interface AgentState {
  isOpen: boolean
  messages: AgentMessage[]
  isLoading: boolean
  showCrisisBanner: boolean
  quickActions: QuickAction[]

  togglePanel: () => void
  openPanel: () => void
  closePanel: () => void
  addMessage: (msg: AgentMessage) => void
  setLoading: (loading: boolean) => void
  setShowCrisisBanner: (show: boolean) => void
  dismissCrisisBanner: () => void
  setQuickActions: (actions: QuickAction[]) => void
  clearMessages: () => void
}

export const useAgentStore = create<AgentState>((set) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  showCrisisBanner: false,
  quickActions: [],

  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setShowCrisisBanner: (show) => set({ showCrisisBanner: show }),
  dismissCrisisBanner: () => set({ showCrisisBanner: false }),
  setQuickActions: (actions) => set({ quickActions: actions }),
  clearMessages: () => set({ messages: [] }),
}))
