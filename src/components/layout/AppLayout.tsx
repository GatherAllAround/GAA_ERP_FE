import { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { authApi } from '@/api/auth'
import Header from './Header'
import BottomNav from './BottomNav'

export default function AppLayout() {
  const { isAuthenticated, user, setUser, clearAuth } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !user) {
      authApi.getMe()
        .then((res) => setUser(res.data))
        .catch(() => clearAuth())
    }
  }, [isAuthenticated, user, setUser, clearAuth])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
