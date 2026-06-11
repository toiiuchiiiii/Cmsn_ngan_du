import ky from 'ky'
import { useAuthStore } from '@/stores/auth-store'

export const api = ky.create({
  prefixUrl: '/api/v1',
  hooks: {
    beforeRequest: [
      (request: Request) => {
        const token = useAuthStore.getState().token
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (_request: Request, _options: unknown, response: Response) => {
        if (response.status === 401) {
          const { isAuthenticated, refreshToken, logout } = useAuthStore.getState()
          if (isAuthenticated) {
            try {
              await refreshToken()
            } catch {
              logout()
            }
          }
        }
      },
    ],
  },
})
