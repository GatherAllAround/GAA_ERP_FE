import apiClient from './client'
import type { User, UserRole } from '@/types/user'

export const usersApi = {
  getAll: () =>
    apiClient.get<User[]>('/api/users'),

  updateMe: (data: { nickname?: string; affiliation?: string }) =>
    apiClient.put<User>('/api/users/me', data),

  updateRole: (userId: number, role: UserRole) =>
    apiClient.put<User>(`/api/users/${userId}/role`, { role }),
}
