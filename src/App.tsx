import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import AppLayout from '@/components/layout/AppLayout'
import AdminGuard from '@/components/guards/AdminGuard'
import { lazy, Suspense } from 'react'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const KakaoCallbackPage = lazy(() => import('@/features/auth/pages/KakaoCallbackPage'))
const CalendarPage = lazy(() => import('@/features/calendar/pages/CalendarPage'))
const NoticeListPage = lazy(() => import('@/features/notices/pages/NoticeListPage'))
const NoticeDetailPage = lazy(() => import('@/features/notices/pages/NoticeDetailPage'))
const TeamListPage = lazy(() => import('@/features/teams/pages/TeamListPage'))
const MemberManagementPage = lazy(() => import('@/features/admin/pages/MemberManagementPage'))

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center text-gray-500">
              로딩 중...
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/calendar" replace />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/notices" element={<NoticeListPage />} />
              <Route path="/notices/:id" element={<NoticeDetailPage />} />
              <Route path="/teams" element={<TeamListPage />} />
              <Route
                path="/admin/members"
                element={
                  <AdminGuard>
                    <MemberManagementPage />
                  </AdminGuard>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
