# 할 일 목록 (TodoList)

HTML, CSS, TypeScript로 구현한 우선순위 기반 할 일 관리 앱입니다.
데이터는 Supabase에 저장되며 GitHub Pages로 배포되어 있습니다.

**배포 URL**: https://uyggnodkrap.github.io/todo-app/

## 기능

- **할 일 추가** — 입력창에 내용을 입력 후 추가 버튼 또는 Enter 키로 등록
- **완료 체크** — 체크박스 클릭으로 완료/미완료 전환 (완료 시 취소선 표시)
- **우선순위 관리** — 생성 시 기본값은 `보통`, 각 항목의 드롭다운으로 언제든 변경 가능
- **자동 정렬** — 우선순위 높은 순(매우 중요 → 중요 → 보통)으로 자동 정렬
- **할 일 삭제** — 항목에 마우스를 올리면 나타나는 삭제 버튼으로 제거
- **데이터 유지** — Supabase DB에 저장되어 기기/브라우저에 관계없이 데이터 동기화

## 우선순위

| 단계 | 표시 색상 |
|------|----------|
| 매우 중요 | 빨강 |
| 중요 | 노랑 |
| 보통 | 회색 |

## 기술 스택

- HTML5
- CSS3
- TypeScript (tsc로 컴파일, 빌드 툴 없음)
- [Supabase](https://supabase.com) — PostgreSQL 기반 백엔드 DB

## 파일 구조

```
todo/
├── index.html          # 메인 HTML (importmap 포함)
├── style.css           # 스타일
├── tsconfig.json       # TypeScript 컴파일러 설정
├── src/
│   ├── app.ts          # 앱 로직 (CRUD, DOM 조작)
│   └── supabase.ts     # Supabase 클라이언트 초기화
├── dist/               # tsc 컴파일 결과 (자동 생성)
├── SUPABASE.md         # Supabase 설정 가이드
└── GITHUB_PAGES.md     # GitHub Pages 배포 가이드
```

## 로컬 개발

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

`src/supabase.ts`에 Project URL과 anon key를 입력합니다.
자세한 설정 방법은 [SUPABASE.md](./SUPABASE.md)를 참고하세요.

### 3. 컴파일

```bash
npx tsc
```

개발 중 자동 재컴파일:

```bash
npx tsc --watch
```

### 4. 실행

```bash
python3 -m http.server 3000
```

브라우저에서 `http://localhost:3000` 접속

> `file://` 프로토콜로 직접 열면 ESM 및 브라우저 보안 정책으로 스크립트가 차단됩니다.

## 배포

GitHub Pages 배포 방법은 [GITHUB_PAGES.md](./GITHUB_PAGES.md)를 참고하세요.
