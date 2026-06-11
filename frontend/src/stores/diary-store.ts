import { create } from 'zustand'
import { api } from '@/lib/api'
import type { DiaryEntry } from '@/types'
import type { CreateEntryFormData } from '@/lib/diary-schemas'

interface DiaryState {
  entries: DiaryEntry[]
  isLoading: boolean
  error: string | null

  fetchEntries: () => Promise<void>
  createEntry: (data: CreateEntryFormData) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
}

export const useDiaryStore = create<DiaryState>((set) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchEntries: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get('diary').json<{ entries: DiaryEntry[] }>()
      set({ entries: data.entries, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải nhật ký'
      set({ isLoading: false, error: message })
    }
  },

  createEntry: async (formData: CreateEntryFormData) => {
    set({ isLoading: true, error: null })
    try {
      await api.post('diary', { json: formData })
      const data = await api.get('diary').json<{ entries: DiaryEntry[] }>()
      set({ entries: data.entries, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo mục nhật ký'
      set({ isLoading: false, error: message })
      throw err
    }
  },

  deleteEntry: async (id: number) => {
    set({ error: null })
    try {
      await api.delete(`diary/${id}`)
      const data = await api.get('diary').json<{ entries: DiaryEntry[] }>()
      set({ entries: data.entries })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa mục nhật ký'
      set({ error: message })
      throw err
    }
  },
}))
