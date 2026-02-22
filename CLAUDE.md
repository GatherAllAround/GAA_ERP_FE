# CLAUDE.md

## 프로젝트 진입

이 프로젝트에서 작업을 시작하기 전에 반드시 아래 문서를 순서대로 읽는다.

1. `PROJECT_GUIDE.md` — 문서 체계와 AI 작업 프로토콜
2. `README.md` — 프로젝트 개요, 기능, 기술 스택
3. `ARCHITECTURE.md` — 통신 규약, 인증, 에러 처리, 구조 규칙

작업 대상 폴더에 `.context.md`가 있으면 코드보다 먼저 읽는다.

## 핵심 규칙

- **상태 관리:** 서버 데이터는 TanStack Query, 클라이언트 상태는 Zustand. 섞지 않는다.
- **API 호출:** 반드시 `src/api/client.ts`의 Axios 인스턴스를 통한다. 직접 axios/fetch 호출 금지.
- **타입:** BE 응답의 snake_case 필드명을 그대로 사용한다. camelCase 변환하지 않는다.
- **경로 별칭:** `@/`를 사용한다. 상대 경로(`../../`)는 같은 feature 내부에서만 허용.
- **기능 간 참조 금지:** `features/A`에서 `features/B`를 직접 import하지 않는다.

## 커맨드

```bash
npm run dev       # 개발 서버 (localhost:5173)
npm run build     # 타입 체크 + 빌드
npm run lint      # ESLint
```
