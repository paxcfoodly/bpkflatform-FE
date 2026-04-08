# BPK Hub — Frontend

> **Next.js 14 + TypeScript + Tailwind CSS v4**  
> 식품제조업 커뮤니티 & 포장장비 플랫폼 웹 프론트엔드

---

## 로컬 환경 세팅

### 1. 사전 준비

- **Node.js 18+** (20 LTS 권장)
  ```bash
  node --version  # v18.x 이상 확인
  ```
- **npm** (Node.js에 포함)

### 2. 저장소 클론 + 의존성 설치

```bash
git clone <repo-url> bpkflatform-FE
cd bpkflatform-FE

# 의존성 설치
npm install
```

### 3. 환경변수 설정

`.env.example`을 복사하여 `.env`를 만드세요:

```bash
cp .env.example .env
```

**기본 내용 (로컬 개발):**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

이것만 있으면 됩니다. 백엔드가 `localhost:8000`에서 실행 중이어야 합니다.

**선택 변수:**

| 변수 | 용도 | 없으면? |
|------|------|--------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics | 분석 수집 안 됨 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 연결 | 사용 안 함 (BE가 직접 DB 접근) |

### 4. 백엔드 먼저 실행

프론트엔드는 백엔드 API에 의존합니다.  
**반드시 백엔드를 먼저 실행**하세요:

```bash
# 별도 터미널에서 백엔드 실행
cd bpkflatform-BE
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

### 5. 프론트엔드 실행

```bash
# 개발 서버 시작 (핫 리로드)
npm run dev
```

정상 시작 시:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

### 6. 동작 확인

| 확인 항목 | URL | 기대 결과 |
|----------|-----|----------|
| 메인 페이지 | http://localhost:3000 | 홈 페이지 정상 렌더링 |
| 연결 상태 | http://localhost:3000/status | BE 연결 상태 확인 |
| 컴포넌트 데모 | http://localhost:3000/showcase | 공통 컴포넌트 갤러리 |
| 로그인 | http://localhost:3000/auth/login | 로그인 페이지 |
| 관리자 | http://localhost:3000/admin | (로그인 후) 관리자 대시보드 |

### 7. 테스트 계정 (백엔드 시드 데이터)

| 항목 | 값 |
|------|-----|
| 이메일 | `admin@bpkhub.co.kr` |
| 비밀번호 | `Admin1234!` |
| 역할 | 관리자 (ADMIN) |

---

## 프로젝트 구조

```
bpkflatform-FE/
├── app/                     # Next.js App Router 페이지 (55개 라우트)
│   ├── admin/               # 관리자 CMS (12페이지)
│   ├── ai/matching/         # AI 포장형태 매칭
│   ├── auth/                # 인증 (로그인/가입/인증/비밀번호)
│   ├── community/           # 커뮤니티 게시판 (4종)
│   ├── info/                # 공고, 시세, HACCP
│   ├── inquiry/             # 견적·문의·A/S
│   ├── my/                  # 마이페이지
│   ├── news/                # 뉴스·공지
│   ├── products/            # 제품/장비
│   └── about/               # 회사소개
├── components/
│   ├── layout/              # GNB, Footer, AdminLayout, Guard
│   ├── ui/                  # 공통 UI (Button, Card, Modal, Toast 등)
│   └── form/                # 폼 컴포넌트 (Input, Select, Checkbox 등)
├── hooks/                   # TanStack Query 훅
├── lib/api/                 # API 클라이언트 (타입 + fetch 래퍼)
├── stores/                  # Zustand 스토어 (인증 상태)
├── middleware.ts            # 서버사이드 라우트 보호
├── tailwind.config.ts       # (사용 안 함 — Tailwind v4 @theme inline)
└── package.json
```

---

## 주요 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm start

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 (`@theme inline`) |
| 상태 관리 | Zustand (인증) + TanStack Query (서버 상태) |
| 폼 | react-hook-form + Zod v4 |
| 에디터 | Tiptap (커뮤니티 리치 텍스트) |
| 차트 | Recharts (시세 대시보드) |
| 캐러셀 | Embla Carousel |
| 아이콘 | Lucide React |

---

## 참고

- 백엔드 README → `bpkflatform-BE/README.md`
- API 명세서 → `docs/api-spec.md`
- 디자인 시스템 → `docs/design-system.md`
- 전체 기획서 → `bpk_platform_2차_기획서.md`
