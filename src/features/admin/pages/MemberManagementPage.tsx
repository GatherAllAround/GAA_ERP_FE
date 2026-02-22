import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import type { User, UserRole } from '@/types/user'

const ROLE_LABELS: Record<UserRole, string> = {
  root: '루트',
  admin: '운영진',
  member: '멤버',
}

export default function MemberManagementPage() {
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then((res) => res.data),
  })

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
      usersApi.updateRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">로딩 중...</div>
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">멤버 관리</h2>
      {!users?.length ? (
        <p className="text-center text-gray-400">등록된 멤버가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((user) => (
            <MemberCard
              key={user.user_id}
              user={user}
              onRoleChange={(role) =>
                updateRole.mutate({ userId: user.user_id, role })
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function MemberCard({
  user,
  onRoleChange,
}: {
  user: User
  onRoleChange: (role: UserRole) => void
}) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        {user.kakao_profile_image_url ? (
          <img
            src={user.kakao_profile_image_url}
            alt={user.nickname}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm text-gray-500">
            {user.nickname[0]}
          </div>
        )}
        <div>
          <p className="font-medium">{user.nickname}</p>
          {user.affiliation && (
            <p className="text-xs text-gray-400">{user.affiliation}</p>
          )}
        </div>
      </div>
      <select
        value={user.role}
        onChange={(e) => onRoleChange(e.target.value as UserRole)}
        className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
      >
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </li>
  )
}
