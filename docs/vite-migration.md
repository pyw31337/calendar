# P6 Vite 마이그레이션 준비 (P6-0)

점검일: 2026-08-20

## 현재 상태

- 배포: GitHub Pages + `index.html`이 `assets/*.js`를 defer 스크립트로 로드
- 이미 `vite` / `@vitejs/plugin-react`가 package.json에 있음 (`npm run dev` / `build`)
- UI는 `window.GATHER_UI_COMPONENTS` + `GATHER_UI_DEPS` IIFE 패턴으로 점진 분리됨
- `app-main.js`에는 **App 본체**(상태·라우팅·Firestore 구독)가 남아 있음

## 목표

1. `src/` 트리로 소스 이전 (기능 동결 스프린트)
2. Vite 빌드 산출물을 Pages에 배포
3. code-splitting (view별 청크: chat / memo / places / admin)

## 권장 단계 (기능 동결 후)

1. **P6-1** 현재 assets를 src로 복사하는 브리지 (동작 동일, import만 정리)
2. **P6-2** App을 라우트/뷰 단위로 쪼개며 dynamic import
3. **P6-3** GitHub Actions 빌드 산출물 배포로 전환
4. **P6-4** 구형 assets 경로 제거

## 제약

- Vite와 기능 수정을 **한 커밋에 섞지 않음**
- 캘린더 데이터 격리·share URL·디자인 규칙 검사 유지
- 배포 전 `npm run check:all` + `npm run smoke:live` 필수

## 사전 조건 (완료됨)

- [x] 주요 UI 컴포넌트 외부 파일 분리 (P4)
- [x] firebase-services 계층
- [x] check:required-symbols / asset-mirrors / isolation
- [ ] App 본체 분리 (선택, Vite 전 또는 병행)

## 기능 동결 선언 (2026-08-20)
P4 완료 후 기능 동결. P6 Vite 작업만 진행.

### P6-1 완료 (2026-08-20)
- assets → src/core + src/ui 복사 완료
- src/main.jsx 스텁 생성
- 라이브(index.html + assets/) 동작 동일 유지
- 다음: P6-2 (App 분리 + dynamic import) 준비

### P6-1 main 반영 완료 (2026-08-20)
- p6-1-vite-bridge → main 머지 완료
- 라이브 동작 동일 유지 확인
- 다음 단계: P6-2 (기능 동결 상태에서 App 분리 준비)

### P6-2 준비 시작 (2026-08-20)
- 브랜치: p6-2-app-split-prep
- src/README.md 및 docs/p6-2-plan.md 작성
- 실제 코드 분리는 아직 시작하지 않음

### P6-2 구역 지도 (2026-08-20)
- docs/p6-2-app-main-map.md 추가
- src/core/app-main.js 코드는 아직 수정하지 않음

### P6-2 준비 반영 (2026-08-20)
- app-main 구역 지도 + src/core/app-main.js 구역 주석만 추가
- 라이브 assets/ 미변경
- p6-2-app-split-prep → main 머지

### P6-2 뷰 마커 반영 (2026-08-20)
- src/core/app-main.js 에 chat/memo/places/gallery/settlement/admin 주석 추가
- 라이브 assets/ 미변경
- p6-2-view-markers → main 머지

### P6-2 첫 파일 복사 (2026-08-20)
- src/core/admin-routes.js 추가 (원본 함수는 app-main에 유지)
- p6-2-copy-admin-routes → main 머지

### P6-2 구독 헬퍼 복사 (2026-08-20)
- src/core/subscriptions.js 추가
- p6-2-copy-subscriptions → main 머지

### P6-2 캐시/deps 복사 (2026-08-20)
- src/core/cache-and-deps.js 추가
- p6-2-copy-cache-deps → main 머지

### P6-2 캐시/deps 복사 (2026-08-20)
- src/core/cache-and-deps.js 추가
- p6-2-copy-cache-deps → main 머지

### P6-3 준비 시작 (2026-08-20)
- docs/p6-3-plan.md 작성
- 배포 경로 변경 없음. 라이브 유지.

### P6 인계 태그 (2026-08-20)
- docs/p6-handoff.md 작성
- 태그: safe-20260820-p6-prep
- 다음 세션: 실제 앱 JS를 Vite가 묶게 만들기. 라이브 경로 유지.
