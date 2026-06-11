import { create } from 'zustand'
import { api } from '@/lib/api'
import type { User } from '@/types'
import { useChatStore } from './chat-store'
import { useAgentStore } from './agent-store'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  fetchMe: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('auth/login', { json: { email, password } }).json<{ success: boolean; data: { user: User } }>()
      set({
        token: null,
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại'
      set({ isLoading: false, error: message })
      throw err
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('auth/register', { json: { name, email, password } }).json<{ success: boolean; data: { user: User } }>()
      set({
        token: null,
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại'
      set({ isLoading: false, error: message })
      throw err
    }
  },

  logout: async () => {
    try {
      await api.post('auth/logout')
    } catch {
    } finally {
      useChatStore.getState().purge()
      useAgentStore.getState().clearMessages()
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  refreshToken: async () => {
    try {
      const res = await api.post('auth/refresh').json<{ success: boolean; data: { user: User } }>()
      set({
        token: null,
        user: res.data.user,
        isAuthenticated: true,
      })
    } catch {
      get().logout()
    }
  },

  fetchMe: async () => {
    set({ isLoading: true })
    try {
      const res = await api.get('auth/me').json<{ success: boolean; data: { user: User } }>()
      set({
        user: res.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
