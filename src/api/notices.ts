import apiClient from './client'
import type { Notice, NoticeListResponse } from '@/types/notice'

export const noticesApi = {
  getAll: (page = 1, size = 20) =>
    apiClient.get<NoticeListResponse>('/api/notices', { params: { page, size } }),

  getById: (id: number) =>
    apiClient.get<Notice>(`/api/notices/${id}`),

  create: (data: { title: string; content: string }) =>
    apiClient.post<Notice>('/api/notices', data),

  update: (id: number, data: { title?: string; content?: string }) =>
    apiClient.put<Notice>(`/api/notices/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/notices/${id}`),
}
