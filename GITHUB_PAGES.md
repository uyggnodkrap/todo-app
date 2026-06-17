# GitHub Pages 배포 가이드

배포 후 접속 URL: `https://uyggnodkrap.github.io/todo-app/`

---

## 사전 준비

- GitHub 계정: `uyggnodkrap`
- 배포 대상 repo: `todo-app` (public)
- 로컬 clone 위치: `/home/park/work`

---

## Step 1. GitHub에서 repo 생성

1. [https://github.com/new](https://github.com/new) 접속
2. 아래 값 입력:
   - **Repository name**: `todo-app`
   - **Visibility**: `Public`
3. **Create repository** 클릭 (README, .gitignore 체크 없이)

---

## Step 2. 로컬에 clone

```bash
cd /home/park/work
git clone https://github.com/uyggnodkrap/todo-app.git
cd todo-app
```

---

## Step 3. 소스 파일 복사

현재 작업 디렉토리에서 필요한 파일을 복사합니다.

```bash
SRC=/home/park/work/kosa-vibecoding-2026-3rd/src/exercise/uyggnodkrap26/day02/todo
DEST=/home/park/work/todo-app

cp $SRC/index.html      $DEST/
cp $SRC/style.css       $DEST/
cp $SRC/tsconfig.json   $DEST/
cp $SRC/package.json    $DEST/
cp $SRC/package-lock.json $DEST/
cp -r $SRC/src          $DEST/
```

---

## Step 4. .gitignore 생성

`dist/`는 GitHub Pages가 직접 서빙하므로 **gitignore에서 제외**합니다.

```bash
cat > /home/park/work/todo-app/.gitignore << 'EOF'
node_modules/
EOF
```

---

## Step 5. 빌드

```bash
cd /home/park/work/todo-app
npm install
npx tsc
```

`dist/app.js`, `dist/supabase.js` 생성 확인.

---

## Step 6. 커밋 및 푸시

```bash
cd /home/park/work/todo-app
git add .
git commit -m "feat: TodoList 앱 배포"
git push origin main
```

---

## Step 7. GitHub Pages 활성화

1. `https://github.com/uyggnodkrap/todo-app` → **Settings** 탭
2. 왼쪽 사이드바 → **Pages**
3. **Source** 섹션:
   - Branch: `main`
   - Folder: `/ (root)`
4. **Save** 클릭
5. 약 1~2분 후 상단에 배포 URL 표시 확인

---

## Step 8. 접속 확인

```
https://uyggnodkrap.github.io/todo-app/
```

브라우저에서 위 URL 접속 후 할 일 추가 → Supabase에 저장되는지 확인.

---

## 주의사항

- `src/supabase.ts`에 포함된 `anon (public) key`는 Supabase가 공개용으로 설계한 키이므로 public repo에 포함해도 무방합니다. 단, `service_role` 키는 절대 포함하지 마세요.
- 소스 수정 후 재배포 시 `npx tsc` → `git add dist/ → git commit → git push` 순으로 진행합니다.
