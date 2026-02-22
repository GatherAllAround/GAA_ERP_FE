export interface Team {
  team_id: number
  name: string
  description: string | null
  member_count: number
  created_at: string
}

export interface TeamMember {
  user_id: number
  nickname: string
  kakao_profile_image_url: string | null
  session_name: string
  joined_at: string
}

export interface TeamDetail extends Team {
  members: TeamMember[]
}
