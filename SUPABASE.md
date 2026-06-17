# Supabase 마이그레이션 가이드

localStorage 기반 TodoList 앱을 Supabase로 전환하기 위한 설정 절차입니다.

---

## 체크리스트

### Step 1. Supabase 프로젝트 생성
- [ ] supabase.com 가입
- [ ] 새 프로젝트 생성 (이름, DB 비밀번호, Seoul 리전)
- [ ] 프로비저닝 완료 확인

### Step 2. 데이터베이스 설정
- [ ] SQL Editor에서 `todos` 테이블 생성 DDL 실행
- [ ] Table Editor에서 테이블 및 컬럼 생성 확인

### Step 3. 보안 설정
- [ ] RLS 옵션 결정 (A: 비활성화 / B: 익명 허용 정책)
- [ ] 선택한 옵션의 SQL 실행

### Step 4. API 키 확인
- [ ] Settings → API에서 **Project URL** 복사
- [ ] Settings → API에서 **anon (public) key** 복사

### Step 5. 클라이언트 연동
- [x] 연동 방법 선택 (B: ESM)
- [x] `tsconfig.json` 수정 (`module: ESNext`, `moduleResolution: bundler`, `skipLibCheck: true`)
- [x] `index.html`에 importmap + `<script type="module">` 적용
- [x] `src/supabase.ts` 생성 — Project URL, anon key로 `createClient()` 초기화

### Step 6. 코드 마이그레이션
- [x] `load()` → Supabase `select` 쿼리로 교체
- [x] `addTodo()` → Supabase `insert` 쿼리로 교체
- [x] `toggleTodo()` → Supabase `update` 쿼리로 교체
- [x] `updatePriority()` → Supabase `update` 쿼리로 교체
- [x] `deleteTodo()` → Supabase `delete` 쿼리로 교체
- [x] `save()` 메서드 제거
- [x] `created_at` 타입 변환 처리 (number ↔ ISO 문자열)
- [x] 모든 DB 메서드 `async/await` 적용

### Step 7. 검증
- [x] 할 일 추가 → Supabase Table Editor에서 행 생성 확인
- [x] 완료 체크 → DB `completed` 값 변경 확인
- [x] 우선순위 변경 → DB `priority` 값 변경 확인
- [x] 삭제 → DB에서 행 제거 확인
- [x] 새로고침 후 데이터 유지 확인

---

## 1. Supabase 가입 및 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 접속 → **Start your project** 클릭
2. GitHub 계정으로 가입 (권장)
3. Dashboard → **New project** 클릭
4. 아래 값 입력:
   - **Name**: `todo-app` (원하는 이름)
   - **Database Password**: 안전한 비밀번호 입력 후 별도 보관
   - **Region**: `Northeast Asia (Seoul)`
5. **Create new project** 클릭 → 프로비저닝 완료까지 약 1분 대기

---

## 2. 테이블 생성

Dashboard → **SQL Editor** → **New query**에 아래 SQL을 붙여넣고 실행합니다.

```sql
create table todos (
  id          text        primary key,
  text        text        not null,
  completed   boolean     not null default false,
  priority    text        not null default '보통'
                check (priority in ('보통', '중요', '매우 중요')),
  created_at  timestamptz not null default now()
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | text | 기존 `Date.now().toString()` 값 그대로 사용 |
| `text` | text | 할 일 내용 |
| `completed` | boolean | 완료 여부 |
| `priority` | text | `'보통'` / `'중요'` / `'매우 중요'` |
| `created_at` | timestamptz | 생성 시각 (자동 입력) |

---

## 3. API 키 확인

Dashboard → 프로젝트 선택 → **Settings** → **API**

필요한 값 두 가지를 복사해 둡니다:

| 항목 | 용도 |
|------|------|
| **Project URL** | Supabase 클라이언트 초기화에 사용 |
| **anon (public) key** | 클라이언트 코드에 포함하는 공개 키 |

> **주의**: `service_role` 키는 서버 전용입니다. 클라이언트(브라우저) 코드에 절대 포함하지 마세요.

---

## 4. Row Level Security (RLS) 설정

현재 앱은 별도 로그인 없는 익명 접근 구조입니다. 아래 두 옵션 중 선택하세요.

### 옵션 A — 학습/개발용 (RLS 비활성화)

Dashboard → **Table Editor** → `todos` 테이블 → **RLS disabled** 상태 유지

`anon` 키로 모든 접근이 허용됩니다. 공개 배포 시에는 사용하지 마세요.

### 옵션 B — 권장 (RLS 활성화 + 익명 허용 정책)

SQL Editor에서 실행:

```sql
alter table todos enable row level security;

create policy "anon full access"
  on todos
  for all
  to anon
  using (true)
  with check (true);
```

인증 없이도 `anon` 키로 CRUD가 허용됩니다.

---

## 5. 클라이언트 연동 방법

현재 앱은 `tsconfig.json`의 `"module": "None"` 설정으로 번들러 없이 동작합니다.
Supabase JS SDK는 ESM 전용이므로 아래 두 방법 중 하나를 선택해야 합니다.

### 방법 A — CDN UMD (tsconfig 변경 없음, 간단)

`index.html`에 Supabase 스크립트 태그를 앱 스크립트보다 먼저 추가:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="dist/app.js"></script>
```

`src/app.ts`에서 전역 객체로 클라이언트 생성:

```ts
declare const supabase: any;

const client = supabase.createClient(
  'https://YOUR_PROJECT_URL.supabase.co',
  'YOUR_ANON_KEY'
);
```

### 방법 B — ESM import (tsconfig 변경 필요)

`tsconfig.json` 수정:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

`index.html`의 script 태그에 `type="module"` 추가:

```html
<script type="module" src="dist/app.js"></script>
```

`src/app.ts` 상단에 import 추가:

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const client = createClient(
  'https://YOUR_PROJECT_URL.supabase.co',
  'YOUR_ANON_KEY'
);
```

---

## 6. 기존 코드 변경 포인트

`src/app.ts`의 `localStorage` 관련 메서드를 아래 Supabase 쿼리로 교체합니다.
모든 쿼리는 `async/await` 기반으로 작성해야 합니다.

| 기존 메서드 | Supabase 쿼리 |
|---|---|
| `load()` | `client.from('todos').select('*').order('created_at', { ascending: true })` |
| `addTodo()` | `client.from('todos').insert({ id, text, completed, priority, created_at })` |
| `toggleTodo()` | `client.from('todos').update({ completed }).eq('id', id)` |
| `updatePriority()` | `client.from('todos').update({ priority }).eq('id', id)` |
| `deleteTodo()` | `client.from('todos').delete().eq('id', id)` |

> `save()` 메서드(전체 배열 덮어쓰기)는 더 이상 사용하지 않습니다.
> 각 메서드가 해당 행만 개별적으로 조작하는 구조로 바뀝니다.

### created_at 처리 주의사항

기존 앱의 `createdAt`은 `number`(Unix ms)이지만, Supabase는 `timestamptz`로 저장합니다.
INSERT 시 변환:

```ts
created_at: new Date(todo.createdAt).toISOString()
```

SELECT 후 변환:

```ts
createdAt: new Date(row.created_at).getTime()
```
