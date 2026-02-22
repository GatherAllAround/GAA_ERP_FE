export type UserRole = 'root' | 'admin' | 'member'

export interface User {
  user_id: number
  kakao_id: number
  nickname: string
  kakao_profile_image_url: string | null
  affiliation: string | null
  role: UserRole
  created_at: string
  updated_at: string
}
