import apiClient from './client'
import type { User } from '@/types/user'

interface AuthResponse {
  access_token: string
  token_type: string
}

export const authApi = {
  kakaoLogin: (code: string) =>
    apiClient.post<AuthResponse>('/api/auth/kakao/login', { code }),

  getMe: () =>
    apiClient.get<User>('/api/auth/me'),
}
