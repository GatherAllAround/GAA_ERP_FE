export interface Session {
  session_id: number
  name: string
  created_at: string
}

export interface UserSession {
  user_session_id: number
  user_id: number
  session_id: number
  is_main: boolean
  skill_level: number
  created_at: string
}
