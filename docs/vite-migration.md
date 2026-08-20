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
