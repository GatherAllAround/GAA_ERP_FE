import apiClient from './client'
import type { Session, UserSession } from '@/types/session'

export const sessionsApi = {
  getAll: () =>
    apiClient.get<Session[]>('/api/sessions'),

  create: (data: { name: string }) =>
    apiClient.post<Session>('/api/sessions', data),

  getMySessions: () =>
    apiClient.get<UserSession[]>('/api/sessions/me'),

  addMySession: (data: { session_id: number; is_main?: boolean; skill_level?: number }) =>
    apiClient.post<UserSession>('/api/sessions/me', data),

  updateMySession: (userSessionId: number, data: { is_main?: boolean; skill_level?: number }) =>
    apiClient.put<UserSession>(`/api/sessions/me/${userSessionId}`, data),

  deleteMySession: (userSessionId: number) =>
    apiClient.delete(`/api/sessions/me/${userSessionId}`),
}
