# 🔗 마이링크 (MyLink)

여러 링크를 한 페이지에 모아 `/username` 주소 하나로 공유하는 링크트리 클론입니다.

**기술 스택**: Next.js 15 (App Router) · shadcn/ui · Tailwind CSS · Firebase (Firestore + Authentication)

## 기능

| 주차 | 기능 | 위치 |
|---|---|---|
| 6주차 | 링크 목록 (Read) | `src/components/link-manager.jsx` |
| 7주차 | 링크 추가 (Create) + 입력 검증 | `AddLinkForm` |
| 9주차 | Firestore 영구 저장 | `src/lib/data.js` |
| 10주차 | 인라인 수정 (Update) · 삭제 확인 모달 (Delete) | `LinkRow`, `Dialog` |
| 11주차 | 구글 소셜 로그인 | `src/components/auth-provider.jsx` |
| 12주차 | 프로필 편집 · `/[username]` 개인 페이지 · Security Rules | `src/app/[username]/page.js`, `firestore.rules` |
| 13주차 | 링크 클릭 수 통계 | `countClick()` |

## 데이터 구조

```
users/{userId}                 프로필: username, displayName, bio
users/{userId}/links/{linkId}  링크:   title, url, icon, clicks, createdAt, updatedAt
usernames/{username}           { uid }  ← /username → userId 매핑, 중복 방지
```

## 실행 방법

### 1. Firebase 준비 (콘솔: console.firebase.google.com)
1. 프로젝트 추가 (예: `mylink-project`, Analytics 사용 안 함)
2. **Firestore Database** 만들기 → 리전 `asia-northeast3 (서울)`
3. **Authentication** → Sign-in method → **Google** 사용 설정
4. 프로젝트 설정 → 웹 앱 추가 → SDK 설정 값 복사
5. Firestore → **규칙** 탭에 `firestore.rules` 내용을 붙여넣고 **게시**

### 2. 환경 변수 (선택)
`src/lib/firebase.js` 에 mylink-713b0 프로젝트 값이 기본으로 들어 있어 바로 실행됩니다. 다른 프로젝트를 쓸 때만 `env.local.example` 을 `.env.local` 로 복사해 값을 넣으세요.

### 3. 실행
```bash
npm install
npm run dev
```
http://localhost:3000 접속 → Google로 시작하기 → 마이페이지에서 링크 추가 → `/내username` 확인

## 보안 규칙 요약
- 읽기: 누구나 (로그인 불필요)
- 쓰기: 로그인한 본인만
- 예외: 다른 사람은 링크의 `clicks` 를 **정확히 +1** 하는 것만 가능 (클릭 통계용)

## 배포 (14주차)
1. GitHub에 push
2. vercel.com → New Project → 저장소 선택
3. Environment Variables 에 `.env.local` 의 6개 값 입력 → Deploy
4. Firebase 콘솔 → Authentication → 설정 → **승인된 도메인**에 `xxx.vercel.app` 추가

## shadcn/ui 컴포넌트 추가
`components.json` 이 설정되어 있어서 필요할 때 바로 추가할 수 있습니다.
```bash
npx shadcn@latest add badge
```
