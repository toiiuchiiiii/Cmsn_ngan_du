import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { TestResult } from '@/types'

export function useTestHistory() {
  return useQuery({
    queryKey: ['tests'],
    queryFn: () => api.get('tests').json<{ tests: TestResult[] }>(),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })
}

export function useSaveTest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { test_type: string; score: number; severity: string; result: string; answers: number[] }) =>
      api.post('tests', { json: data }).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  })
}
