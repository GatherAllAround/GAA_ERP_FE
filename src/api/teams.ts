import apiClient from './client'
import type { Team, TeamDetail } from '@/types/team'

export const teamsApi = {
  getAll: () =>
    apiClient.get<Team[]>('/api/teams'),

  getById: (id: number) =>
    apiClient.get<TeamDetail>(`/api/teams/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<Team>('/api/teams', data),

  update: (id: number, data: { name?: string; description?: string }) =>
    apiClient.put<Team>(`/api/teams/${id}`, data),

  addMember: (teamId: number, data: { user_id: number; session_id: number }) =>
    apiClient.post(`/api/teams/${teamId}/members`, data),

  removeMember: (teamId: number, userId: number) =>
    apiClient.delete(`/api/teams/${teamId}/members/${userId}`),
}
