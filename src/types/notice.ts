export interface Notice {
  notice_id: number
  author_id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface NoticeListResponse {
  items: Notice[]
  total: number
  page: number
  size: number
}
