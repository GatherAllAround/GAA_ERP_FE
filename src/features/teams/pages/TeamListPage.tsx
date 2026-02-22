import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { teamsApi } from '@/api/teams'
import type { TeamDetail } from '@/types/team'

export default function TeamListPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getAll().then((res) => res.data),
  })

  const { data: teamDetail } = useQuery({
    queryKey: ['team', selectedTeamId],
    queryFn: () => teamsApi.getById(selectedTeamId!).then((res) => res.data),
    enabled: selectedTeamId !== null,
  })

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">로딩 중...</div>
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold">팀 조회</h2>
      {!teams?.length ? (
        <p className="text-center text-gray-400">등록된 팀이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <button
              key={team.team_id}
              onClick={() => setSelectedTeamId(
                selectedTeamId === team.team_id ? null : team.team_id
              )}
              className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors active:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{team.name}</h3>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Users size={14} />
                  {team.member_count}
                </span>
              </div>
              {team.description && (
                <p className="mt-1 text-sm text-gray-500">{team.description}</p>
              )}
              {selectedTeamId === team.team_id && teamDetail && (
                <TeamMembers detail={teamDetail} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TeamMembers({ detail }: { detail: TeamDetail }) {
  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <ul className="space-y-2">
        {detail.members.map((member) => (
          <li key={member.user_id} className="flex items-center gap-3">
            {member.kakao_profile_image_url ? (
              <img
                src={member.kakao_profile_image_url}
                alt={member.nickname}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
                {member.nickname[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{member.nickname}</p>
              <p className="text-xs text-gray-400">{member.session_name}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
