# ARCHITECTURE.md — 기술적 약속

> 이 문서는 코드를 보지 않고도 **데이터가 흐르는 통로**를 이해하기 위한 시스템 설계도입니다.
> 전역 기술 스택, FE-BE 통신 규약, 인증 방식, 에러 처리 전략, 프로젝트 구조 규칙을 정의합니다.

---

## 1. 전역 기술 스택 (Global Tech Stack)

| 영역 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **코어** | React + TypeScript | 19 / 5.9 | UI 렌더링 + 정적 타입 |
| **빌드** | Vite | 7.3 | 번들링, HMR, 개발 프록시 |
| **라우팅** | react-router-dom | v7 | SPA 클라이언트 라우팅 |
| **서버 상태** | TanStack Query | v5 | 캐싱, 자동 재요청, 뮤테이션 |
| **클라이언트 상태** | Zustand | v5 | 인증 등 전역 클라이언트 상태 |
| **HTTP** | Axios | v1 | API 호출, 인터셉터 기반 인증/에러 처리 |
| **스타일** | Tailwind CSS | v4 | 유틸리티 퍼스트 CSS |
| **캘린더** | react-big-calendar + date-fns | — | 월/주 뷰, 한국어 로컬라이저 |
| **아이콘** | lucide-react | — | UI 아이콘 |
| **Backend** | Python / FastAPI | — | REST API 서버 (별도 레포) |

### 상태 관리 이원화 원칙

```
┌─────────────────────────────────────────────────┐
│                    상태 관리                      │
├────────────────────┬────────────────────────────┤
│   Zustand          │   TanStack Query           │
│   (클라이언트 상태)  │   (서버 상태)               │
├────────────────────┼────────────────────────────┤
│ • 인증 토큰/유저    │ • 예약, 공지, 팀 등 API 데이터 │
│ • UI 전역 플래그    │ • 캐싱 (staleTime: 5분)     │
│ • localStorage 동기 │ • 자동 재시도 (retry: 1)     │
│                    │ • 뮤테이션 → 쿼리 무효화      │
└────────────────────┴────────────────────────────┘
```

- **서버에서 온 데이터**는 반드시 TanStack Query로 관리한다 (`useQuery` / `useMutation`).
- **클라이언트에서만 존재하는 상태**는 Zustand 스토어로 관리한다.
- 두 계층을 섞지 않는다.

---

## 2. FE-BE 통신 규약 (Communication)

### 2.1 통신 방식

- **프로토콜:** REST over HTTPS (개발 시 HTTP)
- **데이터 포맷:** JSON (`Content-Type: application/json`)
- **Base URL:** 환경변수 `VITE_API_BASE_URL`로 주입 (기본 `http://localhost:8000`)

### 2.2 개발 프록시

Vite 개발 서버가 `/api` 경로를 백엔드로 프록시한다:

```
[브라우저] → localhost:5173/api/* → [Vite Proxy] → localhost:8000/api/*
```

```typescript
// vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

### 2.3 API 클라이언트 구조

모든 HTTP 요청은 `src/api/client.ts`에 정의된 **단일 Axios 인스턴스**를 통해 이루어진다.

```
src/api/
├── client.ts          # Axios 인스턴스 (인터셉터 설정)
├── auth.ts            # POST /api/auth/kakao/login, GET /api/auth/me
├── users.ts           # GET /api/users, PUT /api/users/me, PUT /api/users/:id/role
├── notices.ts         # CRUD /api/notices
├── sessions.ts        # CRUD /api/sessions, /api/sessions/me
├── teams.ts           # CRUD /api/teams, /api/teams/:id/members
└── reservations.ts    # CRUD /api/reservations, 참여/취소
```

**규칙:**
- 각 API 모듈은 `apiClient`를 import하여 사용한다.
- 반환 타입은 `src/types/`의 인터페이스와 1:1 매핑된다.
- 엔드포인트 함수는 `AxiosPromise<T>`를 반환하고, 호출부에서 `.data`로 추출한다.

### 2.4 API 엔드포인트 전체 맵

#### 인증 (Auth)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/api/auth/kakao/login` | 카카오 인가 코드 → JWT 발급 | Public |
| GET | `/api/auth/me` | 현재 로그인 사용자 정보 | 로그인 |

#### 사용자 (Users)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/users` | 전체 사용자 목록 | 로그인 |
| PUT | `/api/users/me` | 내 정보 수정 (닉네임, 소속) | 로그인 |
| PUT | `/api/users/:id/role` | 사용자 역할 변경 | Admin |

#### 공지사항 (Notices)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/notices?page&size` | 공지 목록 (페이지네이션) | 로그인 |
| GET | `/api/notices/:id` | 공지 상세 | 로그인 |
| POST | `/api/notices` | 공지 작성 | Admin |
| PUT | `/api/notices/:id` | 공지 수정 | Admin |
| DELETE | `/api/notices/:id` | 공지 삭제 | Admin |

#### 세션 (Sessions)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/sessions` | 전체 세션 목록 | 로그인 |
| POST | `/api/sessions` | 세션 생성 | Admin |
| GET | `/api/sessions/me` | 내 세션 목록 | 로그인 |
| POST | `/api/sessions/me` | 내 세션 추가 | 로그인 |
| PUT | `/api/sessions/me/:id` | 내 세션 수정 | 로그인 |
| DELETE | `/api/sessions/me/:id` | 내 세션 삭제 | 로그인 |

#### 팀 (Teams)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/teams` | 전체 팀 목록 | 로그인 |
| GET | `/api/teams/:id` | 팀 상세 (멤버 포함) | 로그인 |
| POST | `/api/teams` | 팀 생성 | Admin |
| PUT | `/api/teams/:id` | 팀 수정 | Admin |
| POST | `/api/teams/:id/members` | 팀 멤버 추가 | Admin |
| DELETE | `/api/teams/:id/members/:userId` | 팀 멤버 제거 | Admin |

#### 예약 (Reservations)
| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/reservations?year&month` | 월별 예약 목록 | 로그인 |
| GET | `/api/reservations/:id` | 예약 상세 (참여자 포함) | 로그인 |
| POST | `/api/reservations` | 예약 생성 | 로그인 |
| PUT | `/api/reservations/:id` | 예약 수정 | 작성자/Admin |
| DELETE | `/api/reservations/:id` | 예약 삭제 | 작성자/Admin |
| POST | `/api/reservations/:id/participate` | 예약 참여 | 로그인 |
| DELETE | `/api/reservations/:id/participate` | 참여 취소 | 로그인 |

### 2.5 공통 응답 규격

#### 단일 리소스 응답
```json
{
  "user_id": 1,
  "nickname": "홍길동",
  "role": "member",
  ...
}
```

#### 페이지네이션 응답 (공지사항)
```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "size": 20
}
```

#### 인증 응답
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}
```

---

## 3. 인증 시스템 (Authentication)

### 3.1 인증 흐름 — 카카오 OAuth + JWT

```
┌──────────┐     ①  카카오 인가 요청     ┌──────────────┐
│  사용자   │ ────────────────────────→ │  카카오 서버   │
│ (브라우저) │ ←──────────────────────── │              │
│          │     ②  인가 코드 (code)    └──────────────┘
│          │
│          │     ③  code 전달
│          │ ────────────────────────→ ┌──────────────┐
│          │                          │   FastAPI BE  │
│          │ ←──────────────────────── │              │
│          │     ④  access_token (JWT) └──────────────┘
│          │
│          │     ⑤  GET /api/auth/me (Bearer token)
│          │ ────────────────────────→ ┌──────────────┐
│          │                          │   FastAPI BE  │
│          │ ←──────────────────────── │              │
│          │     ⑥  User 객체 반환     └──────────────┘
└──────────┘
```

**단계별 설명:**

| 단계 | 주체 | 동작 |
|------|------|------|
| ① | FE (`LoginPage`) | `kauth.kakao.com/oauth/authorize`로 리디렉트 |
| ② | 카카오 → FE | 인가 코드를 `redirect_uri`로 전달 (`/auth/kakao/callback?code=...`) |
| ③ | FE (`KakaoCallbackPage`) | `POST /api/auth/kakao/login { code }` 호출 |
| ④ | BE → FE | JWT `access_token` 발급 |
| ⑤ | FE (`AppLayout`) | `GET /api/auth/me` 로 사용자 정보 요청 |
| ⑥ | BE → FE | User 객체 반환 → Zustand 스토어 저장 |

### 3.2 토큰 관리

```
┌─────────────────────────────────────────────────────────┐
│                    토큰 생명주기                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  로그인 성공                                             │
│    └→ localStorage.setItem('access_token', jwt)         │
│    └→ Zustand: { token, user, isAuthenticated: true }   │
│                                                         │
│  API 요청 시                                             │
│    └→ Axios Request Interceptor                         │
│    └→ Authorization: Bearer <token>                     │
│                                                         │
│  401 응답 수신 시                                         │
│    └→ Axios Response Interceptor                        │
│    └→ localStorage.removeItem('access_token')           │
│    └→ window.location.href = '/login' (강제 리디렉트)     │
│                                                         │
│  로그아웃                                                │
│    └→ clearAuth() → localStorage 제거 + 상태 초기화       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **저장 위치:** `localStorage` (키: `access_token`)
- **주입 방식:** Axios Request Interceptor가 모든 요청에 자동 첨부
- **만료 처리:** 401 응답 시 토큰 삭제 후 로그인 페이지로 강제 이동
- **Token Refresh:** 현재 미구현 (BE에서 긴 만료 시간 설정으로 대체 추정)

### 3.3 인증 스토어 (Zustand)

```typescript
// src/features/auth/stores/authStore.ts
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean     // !!localStorage.getItem('access_token')으로 초기화
  setAuth(user, token): void   // 로그인 시 호출
  setUser(user): void          // 유저 정보만 갱신
  clearAuth(): void            // 로그아웃 시 호출
}
```

**앱 시작 시 인증 복원 흐름:**
1. Zustand 스토어 생성 시 `localStorage`에서 토큰 존재 여부 확인 → `isAuthenticated` 초기화
2. `AppLayout` 마운트 시 `isAuthenticated === true && user === null`이면 `GET /api/auth/me` 호출
3. 성공 시 유저 정보를 스토어에 저장, 실패 시 `clearAuth()` 호출 → 로그인으로 리디렉트

### 3.4 권한 모델 (RBAC)

| 역할 | 코드값 | 권한 범위 |
|------|--------|----------|
| **Root** | `root` | 모든 권한 + 운영진 권한 부여 |
| **Admin** | `admin` | 멤버 관리, 공지 작성, 팀/세션 관리 |
| **Member** | `member` | 예약 신청, 일정 조회, 공지 확인 |

**FE 권한 제어 방식:**
- **라우트 레벨:** `AdminGuard` 컴포넌트가 `root` / `admin` 역할이 아니면 `/calendar`로 리디렉트
- **UI 레벨:** `BottomNav`에서 `관리` 탭을 `root` / `admin`에게만 노출
- **실제 권한 검증:** BE에서 수행 (FE는 UX 보조 역할)

---

## 4. 에러 처리 전략 (Error Handling)

### 4.1 계층별 에러 처리 구조

```
┌─────────────────────────────────────────────────────────┐
│                      에러 처리 3계층                      │
│                                                         │
│  Layer 1: Axios Response Interceptor (전역)              │
│    └→ 401 → 토큰 삭제 + /login 리디렉트                   │
│    └→ 그 외 → Promise.reject(error) 전파                 │
│                                                         │
│  Layer 2: TanStack Query (쿼리/뮤테이션 레벨)             │
│    └→ retry: 1 (1회 자동 재시도)                          │
│    └→ onError 콜백으로 개별 처리 가능                      │
│    └→ isError / error 상태로 UI 분기                     │
│                                                         │
│  Layer 3: 컴포넌트 (페이지 레벨)                          │
│    └→ isLoading → "로딩 중..." 표시                       │
│    └→ 데이터 없음 → 빈 상태 메시지 표시                     │
│    └→ catch → 로그인 실패 시 /login으로 이동               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Axios Interceptor — 전역 에러 처리

```typescript
// src/api/client.ts
apiClient.interceptors.response.use(
  (response) => response,                    // 성공: 그대로 전달
  (error) => {
    if (error.response?.status === 401) {    // 인증 만료
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)             // 나머지: 호출부로 전파
  },
)
```

### 4.3 TanStack Query — 서버 상태 에러 처리

```typescript
// src/lib/queryClient.ts — 전역 기본 설정
{
  queries: {
    staleTime: 1000 * 60 * 5,    // 5분간 캐시 유효
    retry: 1,                     // 실패 시 1회 재시도
    refetchOnWindowFocus: false,  // 탭 전환 시 재요청 안 함
  },
}
```

**쿼리 사용 패턴:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['reservations', year, month],
  queryFn: () => reservationsApi.getMonthly(year, month).then(res => res.data),
})
```

**뮤테이션 사용 패턴:**
```typescript
const mutation = useMutation({
  mutationFn: (data) => api.update(data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resource'] }),
})
```

### 4.4 현재 미구현 사항

- **Error Boundary:** React Error Boundary 미적용 (런타임 에러 시 빈 화면 가능)
- **Toast/알림:** 사용자 피드백 UI 시스템 없음
- **에러 메시지 표시:** API 에러의 상세 메시지를 사용자에게 보여주는 공통 처리 없음
- **네트워크 오프라인:** 오프라인 감지 및 안내 없음

---

## 5. 프로젝트 구조 규칙 (Project Structure)

### 5.1 폴더 구조와 역할

```
src/
├── api/                  # [통신 계층] API 클라이언트 및 엔드포인트 함수
│   ├── client.ts         #   Axios 인스턴스 (인터셉터)
│   └── {resource}.ts     #   리소스별 API 함수 모음
│
├── components/           # [공유 UI 계층] 전역에서 재사용되는 컴포넌트
│   ├── layout/           #   레이아웃 (AppLayout, Header, BottomNav)
│   └── guards/           #   라우트 가드 (AdminGuard)
│
├── features/             # [기능 계층] 도메인별 기능 모듈
│   └── {feature}/
│       ├── pages/        #   라우트에 매핑되는 페이지 컴포넌트
│       ├── stores/       #   Zustand 스토어 (해당 기능 전용)
│       └── components/   #   해당 기능 전용 컴포넌트 (필요 시)
│
├── types/                # [타입 계층] 공유 TypeScript 인터페이스
│   └── {resource}.ts     #   BE 응답 모델과 1:1 매핑
│
├── lib/                  # [유틸리티 계층] 라이브러리 설정
│   ├── queryClient.ts    #   TanStack Query 클라이언트
│   └── calendarLocalizer.ts  # 캘린더 한국어 설정
│
├── styles/               # [스타일 계층] 글로벌 CSS
│   └── index.css         #   Tailwind 임포트 및 전역 스타일
│
├── App.tsx               # 라우트 정의 + Provider 래핑
└── main.tsx              # ReactDOM 엔트리포인트
```

### 5.2 계층 간 참조 규칙 (의존성 방향)

```
  pages (features)
    ↓ import
  api/  +  stores/  +  components/  +  types/  +  lib/
    ↓ import
  client.ts (api 인스턴스)
```

| 참조 방향 | 허용 여부 | 설명 |
|----------|----------|------|
| `features/` → `api/` | ✅ | 페이지에서 API 함수 호출 |
| `features/` → `types/` | ✅ | 타입 참조 |
| `features/` → `components/` | ✅ | 공유 컴포넌트 사용 |
| `features/` → `lib/` | ✅ | 유틸리티 사용 |
| `api/` → `types/` | ✅ | 응답 타입 지정 |
| `api/` → `api/client` | ✅ | HTTP 인스턴스 사용 |
| `api/` → `features/` | ❌ | API 계층이 기능에 의존하면 안 됨 |
| `types/` → 어디든 | ❌ | 타입은 순수 선언, import 없음 |
| `feature A` → `feature B` | ❌ | 기능 간 직접 참조 금지 (공유 필요 시 `components/`로 승격) |

### 5.3 파일 네이밍 규칙

| 분류 | 규칙 | 예시 |
|------|------|------|
| 페이지 컴포넌트 | `PascalCase` + `Page` 접미사 | `CalendarPage.tsx` |
| 공유 컴포넌트 | `PascalCase` | `AdminGuard.tsx`, `Header.tsx` |
| API 모듈 | `camelCase` (리소스 복수형) | `reservations.ts`, `teams.ts` |
| 타입 파일 | `camelCase` (리소스 단수형) | `user.ts`, `notice.ts` |
| 스토어 | `camelCase` + `Store` 접미사 | `authStore.ts` |
| 유틸리티 | `camelCase` | `queryClient.ts` |

### 5.4 경로 별칭

```typescript
// tsconfig.app.json + vite.config.ts
"@/*" → "./src/*"

// 사용 예시
import { useAuthStore } from '@/features/auth/stores/authStore'
import apiClient from '@/api/client'
```

---

## 6. 라우팅 설계 (Routing)

### 6.1 라우트 보호 체계

```
                         Routes
                           │
              ┌────────────┼────────────┐
              │            │            │
         /login    /auth/kakao/callback  │
         (Public)       (Public)         │
                                    <AppLayout>
                                    (Auth Guard)
                                         │
                    ┌──────────┬─────────┼──────────┐
                    │          │         │          │
                /calendar  /notices  /teams   /admin/members
                            /notices/:id      <AdminGuard>
                                              (Role Guard)
```

### 6.2 라우트 매핑 테이블

| 경로 | 컴포넌트 | 보호 | 비고 |
|------|---------|------|------|
| `/login` | `LoginPage` | — | 카카오 로그인 버튼 |
| `/auth/kakao/callback` | `KakaoCallbackPage` | — | OAuth 콜백 처리 |
| `/` | — | Auth | `/calendar`로 리디렉트 |
| `/calendar` | `CalendarPage` | Auth | 메인 페이지 |
| `/notices` | `NoticeListPage` | Auth | 공지 목록 |
| `/notices/:id` | `NoticeDetailPage` | Auth | 공지 상세 |
| `/teams` | `TeamListPage` | Auth | 팀 목록 |
| `/admin/members` | `MemberManagementPage` | Auth + Admin | 멤버 관리 |

### 6.3 가드 동작 방식

- **AppLayout (인증 가드):** `isAuthenticated === false` → `/login`으로 리디렉트
- **AdminGuard (역할 가드):** `user.role ∉ ['root', 'admin']` → `/calendar`로 리디렉트
- **Suspense:** 전체 라우트를 감싸서 로딩 중 폴백 UI 제공

---

## 7. 레이아웃 & UI 설계 (Layout)

### 7.1 앱 레이아웃 구조

```
┌──────────────────────────────┐
│         Header               │  ← sticky top, z-40
│  [타이틀]         [프로필 🖼️]  │
├──────────────────────────────┤
│                              │
│                              │
│         <Outlet />           │  ← max-w-lg, flex-1
│       (페이지 콘텐츠)          │
│                              │
│                              │
├──────────────────────────────┤
│  📅 달력  📢 공지  👥 팀  ⚙️ 관리 │  ← fixed bottom, z-50
│         BottomNav            │     관리 탭은 admin만 노출
└──────────────────────────────┘
```

### 7.2 모바일 퍼스트 설계

- **최대 너비:** `max-w-lg` (512px) — 모바일 화면 기준
- **Header:** `sticky top-0` — 스크롤 시에도 상단 고정
- **BottomNav:** `fixed bottom-0` — 하단 고정 네비게이션
- **콘텐츠 영역:** `pb-16` — BottomNav 높이만큼 하단 패딩

---

## 8. 타입 시스템 (Type System)

### 8.1 핵심 도메인 타입

```typescript
// User — 사용자
type UserRole = 'root' | 'admin' | 'member'
interface User {
  user_id: number
  kakao_id: number
  nickname: string
  kakao_profile_image_url: string | null
  affiliation: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

// Reservation — 예약
type ReservationStatus = 'open' | 'closed' | 'cancelled'
type ParticipantStatus = 'confirmed' | 'cancelled'
interface Reservation { reservation_id, title, reservation_date, start_time, end_time, ... }
interface ReservationDetail extends Reservation { participants: ReservationParticipant[] }

// Notice — 공지사항
interface Notice { notice_id, author_id, title, content, created_at, updated_at }
interface NoticeListResponse { items: Notice[], total, page, size }

// Team — 팀
interface Team { team_id, name, description, member_count, created_at }
interface TeamDetail extends Team { members: TeamMember[] }

// Session — 세션 (활동 종류)
interface Session { session_id, name, created_at }
interface UserSession { user_session_id, user_id, session_id, is_main, skill_level, created_at }
```

### 8.2 타입 설계 원칙

- BE 응답 모델과 **1:1 매핑** (snake_case 필드명 그대로 사용)
- 상세 조회(`Detail`)는 기본 타입을 `extends`하여 관계 데이터 포함
- 페이지네이션 응답은 `{ items, total, page, size }` 형식으로 통일
- **camelCase 변환 없음** — BE의 snake_case를 FE에서도 그대로 사용

---

## 9. 환경 설정 (Environment)

### 9.1 환경 변수

| 변수명 | 용도 | 예시 |
|--------|------|------|
| `VITE_API_BASE_URL` | 백엔드 API 서버 주소 | `http://localhost:8000` |
| `VITE_KAKAO_CLIENT_ID` | 카카오 REST API 키 | `abc123...` |
| `VITE_KAKAO_REDIRECT_URI` | OAuth 콜백 URL | `http://localhost:5173/auth/kakao/callback` |

### 9.2 TypeScript 설정

- `strict: true` — 모든 엄격 타입 검사 활성화
- `noUnusedLocals: true` — 미사용 변수 에러
- `noUnusedParameters: true` — 미사용 파라미터 에러
- `target: ES2022` — 최신 JS 문법 사용
- `verbatimModuleSyntax: true` — 명시적 type import 강제

### 9.3 빌드 & 스크립트

| 명령어 | 동작 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (port 5173, HMR, API 프록시) |
| `npm run build` | `tsc -b` 타입 검사 → `vite build` 번들링 |
| `npm run lint` | ESLint 실행 |
| `npm run preview` | 빌드 결과물 미리보기 |

---

## 10. 핵심 아키텍처 패턴 요약

### 데이터 흐름 전체 그림

```
[사용자 인터랙션]
       │
       ▼
[페이지 컴포넌트]  ←──  useAuthStore() (인증 상태)
       │
       ▼
[useQuery / useMutation]  ←──  queryClient (캐시, 재시도)
       │
       ▼
[API 모듈]  (reservationsApi.getMonthly 등)
       │
       ▼
[Axios 인스턴스]  ←──  Request Interceptor (Bearer 토큰 자동 삽입)
       │                Response Interceptor (401 → 로그아웃)
       ▼
[Vite Proxy (개발) / 직접 요청 (프로덕션)]
       │
       ▼
[FastAPI Backend]  ←──  JWT 검증, 비즈니스 로직, DB 접근
```

---

**"이 문서를 읽었다면, 코드를 열기 전에 이미 데이터가 어디서 시작되어 어디로 흘러가는지 알고 있어야 한다."**
