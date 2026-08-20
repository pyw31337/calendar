# P6 인계 (2026-08-20)

이 문서를 새 채팅의 첫 입력으로 쓴다.
운영자 본인은 개발자가 아니다. 명령은 복붙 한 블록으로만 준다.
zsh 에서 줄 시작 `#` 주석은 쓰지 말 것.

## 라이브 계약 (깨면 안 됨)
- 배포: GitHub Pages, 저장소 root 의 index.html + assets/*.js
- 사용자는 CDN React + defer 스크립트로 실행
- 캘린더 격리: kkot / cw / jhair 데이터 경로를 하드코딩하지 말 것
- 매 커밋 전: npm run check:all && npm run smoke:live
- 지금은 dist 를 Pages 소스로 쓰면 앱 JS가 빠져 화면이 비어 보인다

## 현재 HEAD
- 브랜치: main
- 커밋: f69d8e2 ci(P6-3): add Vite build-only workflow (no Pages deploy)
- 이전 안전 태그: safe-20260820-p4-complete (P4 UI 분리 완료)
- 이 시점 태그: safe-20260820-p6-prep

## 완료된 것
- P4 기능 코드 사이클 완료, 기능 동결
- P6-1: assets 를 src/core + src/ui 로 복사. 라이브 미연결
- P6-2: app-main 구역/뷰 주석, 헬퍼 복사만 (원본 삭제 안 함)
  - src/core/admin-routes.js
  - src/core/subscriptions.js
  - src/core/cache-and-deps.js
- P6-3 준비:
  - Vite 입력은 src/index.html → src/main.jsx (스텁)
  - 라이브 index.html 은 Vite 엔트리가 아님
  - .github/workflows/vite-build-only.yml 는 빌드만, 배포 안 함
  - Actions: Vite Build Only / Verify Calendar / pages-build-deployment 초록

## 하지 말 것
- index.html 의 assets 스크립트 태그 삭제
- assets/app-main.js 에서 함수 삭제
- Pages 배포 소스를 dist 로 전환
- 기능/UX 추가 (동결 해제 조건: P6-3 빌드 배포 전환 완료 후)

## 새 세션의 다음 작업
목표: Vite가 실제 캘린더 앱 JS를 묶게 만들기. 라이브는 기존 경로 유지.

권장 순서:
1. src/main.jsx 스텁이 아니라 실제 모듈 그래프를 점진 연결 (window.GATHER_* IIFE → ESM)
2. 한 파일씩 import 가능하게 바꾸되, 라이브 assets/ 는 그대로 유지
3. npm run build 가 앱 JS를 dist 에 포함하는지 확인
4. 그 다음에만 안전 태그 후 Pages 전환 검토 (아직 금지)

검사:
- npm run check:all
- npm run smoke:live
- GitHub Actions 의 Vite Build Only 초록

라이브 URL:
- https://pyw31337.github.io/calendar/?id=kkot&view=places
- https://pyw31337.github.io/calendar/?admin=1&id=cw

## P6-4 진행 (2026-08-20)
- src/core 데이터 모듈 4개를 ESM으로 전환 (assets/ 미변경)
  - app-constants.js
  - app-config.js
  - app-calendar-data.js
  - app-chat-data.js
- src/main.jsx 가 위 4개를 import → Vite 번들에 실제 앱 JS 포함
- npm run build: 모듈 7개, dist JS ~7.5KB (이전 스텁 0.78KB)
- 라이브 index.html + assets/ 경로 유지. Pages 전환 아직 금지.
- 다음: app-utils / app-notifications / firebase-services 를 한 파일씩 ESM 연결
