# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope

이 디렉토리(`day02/todo/`)와 그 하위 디렉토리만 읽고 수정한다. 상위 디렉토리나 다른 사용자의 디렉토리는 읽지 않는다.

## Git 규칙

- 브랜치 통합 시 **반드시 merge**를 사용한다. rebase는 금지한다.
- push 전 리모트에 새 커밋이 있으면 `git pull origin main --no-edit` 으로 merge한 뒤 push한다.

## 개발 명령어

```bash
# TypeScript 컴파일 (한 번)
npx tsc

# TypeScript 자동 재컴파일 (개발 중)
npx tsc --watch

# 로컬 서버 실행 (file:// 프로토콜 대신 반드시 사용)
python3 -m http.server 3000
# → http://localhost:3000 접속
```

## 아키텍처

빌드 툴 없는 순수 HTML/CSS/TypeScript 앱. `tsc`가 `src/` 아래 `.ts` 파일을 `dist/`로 컴파일하고, `index.html`이 importmap과 `<script type="module" src="dist/app.js">`로 로드한다. `tsconfig.json`의 `"module": "ESNext"` 설정으로 브라우저 네이티브 ESM을 사용하며, `@supabase/supabase-js`는 importmap을 통해 CDN(`esm.sh`)에서 로드된다.

### 핵심 파일

- `src/supabase.ts` — Supabase 클라이언트 초기화. **Project URL과 anon key가 하드코딩**되어 있으므로 수정 시 주의.
- `src/app.ts` — 모든 UI 로직. `TodoApp` 클래스가 상태(`Todo[]`), DOM 조작, Supabase CRUD를 담당한다.
- `index.html` — DOM 골격 + importmap(`@supabase/supabase-js` → esm.sh CDN). TypeScript가 참조하는 ID: `#todo-form`, `#todo-input`, `#todo-list`, `#empty-message`
- `style.css` — 우선순위별 색상 클래스: `.priority-보통`, `.priority-중요`, `.priority-매우중요`

### 데이터 흐름

1. `DOMContentLoaded` → `new TodoApp()` → `init()` (async)
2. `load()`: `supabase.from('todos').select('*')` → `this.todos`
3. 사용자 액션 → 각 메서드가 Supabase 쿼리 직접 호출 → 인메모리 `this.todos` 업데이트 → `render()`
4. `render()`: `this.todos`를 우선순위 순(매우 중요 → 중요 → 보통)으로 정렬 후 DOM 재구성

### Supabase 쿼리 매핑

| 메서드 | Supabase 쿼리 |
|--------|--------------|
| `load()` | `.from('todos').select('*').order('created_at')` |
| `addTodo()` | `.from('todos').insert({...})` |
| `toggleTodo()` | `.from('todos').update({completed}).eq('id', id)` |
| `updatePriority()` | `.from('todos').update({priority}).eq('id', id)` |
| `deleteTodo()` | `.from('todos').delete().eq('id', id)` |

### 우선순위 정렬 순서

`PRIORITY_ORDER` 상수로 관리 (`src/app.ts` 상단):
- `매우 중요` → 0, `중요` → 1, `보통` → 2
