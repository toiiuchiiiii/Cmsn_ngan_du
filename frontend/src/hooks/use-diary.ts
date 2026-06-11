import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DiaryEntry } from '@/types'
import type { CreateEntryFormData } from '@/lib/diary-schemas'

export function useDiaryEntries() {
  return useQuery({
    queryKey: ['diary'],
    queryFn: () => api.get('diary').json<{ entries: DiaryEntry[] }>(),
    staleTime: 0,
    gcTime: 0,
  })
}

export function useCreateDiaryEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEntryFormData) =>
      api.post('diary', { json: data }).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary'] }),
  })
}

export function useDeleteDiaryEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`diary/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary'] }),
  })
}
