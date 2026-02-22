import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '../stores/authStore'

export default function KakaoCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      navigate('/login', { replace: true })
      return
    }

    authApi.kakaoLogin(code)
      .then(async (res) => {
        localStorage.setItem('access_token', res.data.access_token)
        const meRes = await authApi.getMe()
        setAuth(meRes.data, res.data.access_token)
        navigate('/calendar', { replace: true })
      })
      .catch(() => {
        navigate('/login', { replace: true })
      })
  }, [searchParams, navigate, setAuth])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">로그인 처리 중...</p>
    </div>
  )
}
