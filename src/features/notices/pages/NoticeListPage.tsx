import { useQuery } from '@tanstack/react-query'
import { noticesApi } from '@/api/notices'
import { useNavigate } from 'react-router-dom'

export default function NoticeListPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: () => noticesApi.getAll().then((res) => res.data),
  })

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">로딩 중...</div>
  }

  const notices = data?.items ?? []

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">공지사항</h2>
      {notices.length === 0 ? (
        <p className="text-center text-gray-400">공지사항이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {notices.map((notice) => (
            <li key={notice.notice_id}>
              <button
                onClick={() => navigate(`/notices/${notice.notice_id}`)}
                className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors active:bg-gray-50"
              >
                <h3 className="font-semibold">{notice.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
