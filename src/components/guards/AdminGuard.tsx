import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)

  if (user && !['root', 'admin'].includes(user.role)) {
    return <Navigate to="/calendar" replace />
  }

  return <>{children}</>
}
