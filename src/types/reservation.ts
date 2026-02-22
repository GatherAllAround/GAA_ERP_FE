export type ReservationStatus = 'open' | 'closed' | 'cancelled'
export type ParticipantStatus = 'confirmed' | 'cancelled'

export interface Reservation {
  reservation_id: number
  created_by: number
  creator_nickname: string
  title: string
  reservation_date: string
  start_time: string
  end_time: string
  location: string | null
  description: string | null
  status: ReservationStatus
  max_participants: number | null
  participant_count: number
  created_at: string
  updated_at: string
}

export interface ReservationParticipant {
  user_id: number
  nickname: string
  kakao_profile_image_url: string | null
  status: ParticipantStatus
  participated_at: string
}

export interface ReservationDetail extends Reservation {
  participants: ReservationParticipant[]
}

export interface CreateReservationRequest {
  title: string
  reservation_date: string
  start_time: string
  end_time: string
  location?: string
  description?: string
  max_participants?: number
}
