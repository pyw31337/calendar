# P6 Pages 전환 가이드 (Vite dist)

작성: 2026-08-20
상태: 준비 완료 / 자동 전환 없음 (workflow_dispatch만)

## 현재 라이브
- 소스: 저장소 루트 `index.html` + `assets/*` (classic)
- URL: https://pyw31337.github.io/calendar/

## Vite 프로브
- 로컬: `npm run dev` → http://localhost:5173/?id=kkot
- 빌드: `dist/index.html` + hashed assets

## 전환 절차 (수동)
1. 이 문서와 태그 `safe-20260820-p6-vite-ready` 가 main에 있는지 확인
2. GitHub 저장소 → Settings → Pages
   - Source: **GitHub Actions**
3. Actions 탭 → **Deploy Vite Pages** → Run workflow
4. 배포 후 확인
   - https://pyw31337.github.io/calendar/?id=kkot
   - 채팅/메모/장소/관리자
5. 문제 있으면 즉시 롤백 (아래)

## 롤백
1. Settings → Pages → Source를 다시 **Deploy from a branch**
2. Branch: `main` / folder: `/ (root)`
3. 수 분 후 classic 라이브 복구
4. 또는 태그로 코드 복귀:
   `git checkout safe-20260820-p6-vite-ready`

## 아직 하지 말 것
- main push 시 자동 dist 배포 (아직 연결하지 않음)
- 루트 classic `index.html` / `assets/` 삭제

## 전환 완료 (2026-08-20)
- Pages Source = GitHub Actions
- 배포 워크플로: Deploy Vite Pages (push main + 수동)
- 롤백: Settings → Pages → Deploy from a branch → main / root
- 태그: safe-20260820-p6-vite-live
