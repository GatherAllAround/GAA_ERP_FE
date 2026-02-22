import apiClient from './client'
import type { Reservation, ReservationDetail, CreateReservationRequest } from '@/types/reservation'

export const reservationsApi = {
  getMonthly: (year: number, month: number) =>
    apiClient.get<Reservation[]>('/api/reservations', { params: { year, month } }),

  getById: (id: number) =>
    apiClient.get<ReservationDetail>(`/api/reservations/${id}`),

  create: (data: CreateReservationRequest) =>
    apiClient.post<Reservation>('/api/reservations', data),

  update: (id: number, data: Partial<CreateReservationRequest>) =>
    apiClient.put<Reservation>(`/api/reservations/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/reservations/${id}`),

  participate: (id: number) =>
    apiClient.post(`/api/reservations/${id}/participate`),

  cancelParticipation: (id: number) =>
    apiClient.delete(`/api/reservations/${id}/participate`),
}
