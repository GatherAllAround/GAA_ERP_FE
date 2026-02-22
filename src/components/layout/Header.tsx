import { useAuthStore } from '@/features/auth/stores/authStore'

interface HeaderProps {
  title?: string
}

export default function Header({ title = '게더올어라운드' }: HeaderProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <h1 className="text-lg font-bold">{title}</h1>
        {user && (
          <div className="flex items-center gap-2">
            {user.kakao_profile_image_url && (
              <img
                src={user.kakao_profile_image_url}
                alt={user.nickname}
                className="h-8 w-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-600">{user.nickname}</span>
          </div>
        )}
      </div>
    </header>
  )
}
