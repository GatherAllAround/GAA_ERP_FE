export default function LoginPage() {
  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${
      import.meta.env.VITE_KAKAO_CLIENT_ID
    }&redirect_uri=${
      encodeURIComponent(import.meta.env.VITE_KAKAO_REDIRECT_URI)
    }&response_type=code`

    window.location.href = kakaoAuthUrl
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="mb-12 text-center">
        <h1 className="mb-2 text-3xl font-bold">게더올어라운드</h1>
        <p className="text-gray-500">가장 쉬운 모임 예약과 커뮤니티 관리</p>
      </div>
      <button
        onClick={handleKakaoLogin}
        className="w-full max-w-sm rounded-xl bg-[#FEE500] py-3.5 text-center font-semibold text-[#191919] transition-opacity active:opacity-80"
      >
        카카오로 시작하기
      </button>
    </div>
  )
}
