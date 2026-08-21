# P6 Pages 전환 가이드 (Vite dist)

작성: 2026-08-20
최종 갱신: 2026-08-21
상태: 전환 완료 / main push 시 Vite Pages 자동 배포

## 현재 라이브
- 소스: Vite `src/index.html` + `src/main.jsx` → `dist/`
- 배포: GitHub Actions `Deploy Vite Pages`
- URL: https://pyw31337.github.io/calendar/

## 운영 절차
1. 변경 전 현재 브랜치와 워킹트리를 확인한다.
2. 로컬에서 `npm run check:all`, `npm run safety:test`, `npm run build`를 실행한다.
3. `main`에 push하면 `Deploy Vite Pages`가 자동으로 `dist/`를 배포한다.
4. 배포 후 `npm run smoke:live`로 라이브 URL을 확인한다.

## 롤백
1. GitHub Actions 배포 이력을 확인한다.
2. 코드 롤백이 필요하면 안전 태그 또는 직전 정상 커밋으로 되돌린 새 커밋을 만든다.
3. 긴급하게 classic 루트 배포로 되돌릴 때만 Settings → Pages → Source를 `Deploy from a branch`, `main / root`로 변경한다.
4. classic 롤백 후에는 루트 `index.html`과 `assets/*`가 현재 기능을 모두 포함하는지 반드시 확인한다.

## 아직 조심할 것
- Vite `src/`와 classic `assets/`가 과도기적으로 함께 남아 있다. 기능 수정 시 실제 라이브 소스인 `src/`를 우선 확인한다.
- classic 루트 파일을 삭제하거나 Pages 소스를 바꾸는 작업은 별도 안전 태그와 라이브 스모크 뒤에만 진행한다.
- Firebase Functions 변경은 GitHub Pages 배포만으로 반영되지 않는다. 별도 `firebase deploy --only functions`가 필요하다.

## 전환 완료 (2026-08-20)
- Pages Source = GitHub Actions
- 배포 워크플로: Deploy Vite Pages (push main + 수동)
- 롤백: Settings → Pages → Deploy from a branch → main / root
- 태그: safe-20260820-p6-vite-live
