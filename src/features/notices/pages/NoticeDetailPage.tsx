import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { noticesApi } from '@/api/notices'

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: notice, isLoading } = useQuery({
    queryKey: ['notice', id],
    queryFn: () => noticesApi.getById(Number(id)).then((res) => res.data),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">로딩 중...</div>
  }

  if (!notice) {
    return <div className="p-4 text-center text-gray-500">공지사항을 찾을 수 없습니다.</div>
  }

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500"
      >
        <ChevronLeft size={16} />
        돌아가기
      </button>
      <article>
        <h2 className="mb-2 text-xl font-bold">{notice.title}</h2>
        <p className="mb-4 text-sm text-gray-500">
          {new Date(notice.created_at).toLocaleDateString('ko-KR')}
        </p>
        <div className="whitespace-pre-wrap text-gray-700">{notice.content}</div>
      </article>
    </div>
  )
}
