# 운영 런북 (P7)

최종 갱신: 2026-08-21 (Vite Pages 운영 기준)

## 1. 배포
1. 로컬 검증: `npm run check:all`, `npm run safety:test`, `npm run build`
2. main push → `Deploy Vite Pages` + `Verify Calendar`
3. 배포 후: `npm run smoke:live`
4. Firebase Functions 변경이 포함된 경우 GitHub Pages 배포와 별도로 functions 배포 여부를 확인

## 2. 안전 태그
현재 주요 태그:
- `safe-20260820-p4-complete`: P4 UI 분리 완료
- `safe-20260820-p6-vite-live`: Vite Pages 전환 완료

새로운 대형 구조 변경 전에는 `safe-YYYYMMDD-short-topic` 형식으로 태그를 만든다.

## 3. 모듈 지도

### 라이브 소스
- `src/main.jsx`: Vite 부트스트랩
- `src/core/app-main.js`: App 본체, 상태, 라우팅, Firestore 구독
- `src/core/firebase-services.js`: Firebase 읽기/구독 헬퍼
- `src/ui/*.js`: 화면 및 모달 컴포넌트
- `src/app.css`: 전역 스타일

### Classic 호환 파일
- 루트 `index.html` + `assets/*`는 롤백/참조용으로 남아 있다.
- 현재 GitHub Pages 운영 기준은 Vite `dist/` 배포다.

### UI (`src/ui/*.js`)
- ui-admin-dashboard.js
- ui-admin-modals.js
- ui-calendar-core.js
- ui-chat-gallery.js
- ui-chat-room.js
- ui-chat-sheets.js
- ui-confirm-dialog.js
- ui-date-modal.js
- ui-event-modals.js
- ui-icons.js
- ui-lightbox.js
- ui-memo-view.js
- ui-misc.js
- ui-overlays.js
- ui-place-register.js
- ui-places.js
- ui-remaining.js
- ui-share-modal.js
- ui-shared.js
- ui-side-menu.js
- ui-summary-gallery.js
- ui-user-manual.js
- ui-weather.js
- ui-widgets.js

### 코어 / 서비스
- app-calendar-data.js
- app-chat-data.js
- app-config.js
- app-constants.js
- app-main.js
- app-notifications.js
- app-utils.js
- firebase-services.js

### 잔여 모놀리스
- `src/core/app-main.js` — App 본체가 아직 크다. 다음 구조 개선은 route/view별 App shell 분리를 우선한다.

## 4. 배포 전 스모크 (수동)
1. 메인: 캘린더, 사이드메뉴, 일정 팝업
2. 채팅: 메시지, 갤러리, composer, 사이드메뉴 구분선
3. 메모 / 장소 / 갤러리
4. 공유 URL (`/share/kkot/`, `/share/cw/`, `/share/jhair/`)
5. 어드민 로그인·탭

## 5. Google Cloud 예산 알림
console.cloud.google.com → 결제 → 예산 및 알림 (월 5~10달러 권장, 50/90/100%)

## 6. CI
- Verify Calendar: safety + check:all + size-budget
- Deploy Vite Pages: main push + manual
- Live smoke: main push + daily
- Refresh Calendar OG Pages: manual + daily 18:00 UTC
- Live source guard: `src/`에 JSONBlob, 구형 seed 문구, 하드코딩 캘린더 경로가 다시 들어오면 실패
- Share URL guard: 공유 모달과 공식 공유 페이지가 `/share/{id}/`를 유지하는지 운영 소스와 라이브 URL 기준으로 검사
- Tab wiring guard: 운영 소스의 탭/모드 버튼과 렌더링 분기가 서로 어긋나지 않는지 검사
- Vite dist budget: `npm run build` 후 `npm run check:dist-budget`로 실제 배포 청크 크기 검증

## 7. 다음 큰 단계
1. `src/core/app-main.js`를 route/view 단위로 더 분리
2. `src/main.jsx`에서 모든 UI를 한 번에 import하지 않고 화면별 lazy import로 전환
3. Playwright 기반 E2E/시각 회귀 테스트 추가
4. 알림 진단/푸시 구독 상태를 관리자 화면에 표시
