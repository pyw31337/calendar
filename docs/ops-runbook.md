# 운영 런북 (P7)

최종 갱신: 2026-08-28 (Vite Pages 운영 기준)

## 1. 배포
1. 로컬 검증: `npm run check:all`, `npm run safety:test`, `npm run build`
2. main push → `Deploy Vite Pages` + `Verify Calendar`
3. 배포 후: `npm run smoke:live`
4. Firebase Functions 변경이 포함된 경우 GitHub Pages 배포와 별도로 functions 배포 여부를 확인
5. 운영 데이터 점검: `npm run ops:audit`, `npm run ops:media-audit`

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
- **2026-09-03 측정**: `app-main.js` 11,836 / 13,000줄(`check:architecture-budget` 기준 91%)로 예산에 근접. 이 세션에서는 실제 라이브 인증 브라우저로 회귀 확인이 불가능해(샌드박스 네트워크 제약) 구조 변경을 보류했다 — 실제로 쪼개는 작업은 `docs/split-plan.md`의 15~17단계 방식(순수 함수부터 5~10개씩, 별칭+fallback 유지, 단계마다 build/check/배포/스모크 통과 후 진행)을 그대로 따르고, 실기기 확인이 가능한 세션에서 진행할 것을 권장한다. `vendor-map` 청크(Leaflet, 1.1MB)는 이미 `loadLeaflet()`을 통해 `import('leaflet')` 동적 임포트로 지연 로드되고 있어(app-main.js:11132, index.html에 정적 참조 없음) 추가 code-splitting이 필요하지 않음을 확인했다.

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
- Media integrity audit: `npm run ops:media-audit`가 이미지 URL과 확정 모임 사진까지 읽기 전용으로 점검한다. `invalidCount`가 있으면 자동 삭제 대신 백업·수동 확인을 먼저 한다.
- Firebase write E2E: `npm run e2e:firebase-write`는 운영 캘린더와 분리된 `stress_*` 문서로 동시 저장·수정·삭제 흐름을 재현한다. 익명 삭제 규칙에 막힐 수 있으므로 실행 뒤 `npm run ops:clean-stress` 결과를 확인한다.

## 7. 다음 큰 단계
1. `src/core/app-main.js`를 route/view 단위로 더 분리
2. `src/main.jsx`에서 모든 UI를 한 번에 import하지 않고 화면별 lazy import로 전환
3. Playwright 기반 E2E/시각 회귀 테스트 추가
4. 알림 진단/푸시 구독 상태를 관리자 화면에 표시

## 8. 동시 세션(복수 AI) 작업 규칙

같은 날 여러 AI 세션이 동시에 이 저장소에서 작업할 때(2026-09-03처럼), 각 세션이 매 커밋마다 곧바로 `main`에 push하면 상대방이 그 사이 올린 커밋과 매번 머지해야 해서 `Merge remote-tracking branch ...` 커밋이 과도하게 쌓인다. 기능/버그 자체에는 영향이 없지만 히스토리 추적이 어려워진다.

- 여러 세션이 동시에 작업 중임을 인지했다면, 커밋마다 바로 main에 push하기보다 짧은 기능 브랜치에서 1~수 커밋을 모은 뒤 fetch → merge → push로 한 번에 반영한다.
- push 직전에는 항상 `git fetch origin main`으로 상대 세션의 새 커밋 여부를 먼저 확인한다(이미 이 저장소의 관례).
- 병합 충돌이 발생하면 파일을 통째로 덮어쓰지 말고, 두 세션이 각각 어떤 목적으로 수정했는지 diff를 읽고 의미를 보존해 병합한다.
- 브랜치 이름은 `claude/<topic>` / `grok/<topic>`처럼 세션 출처가 드러나게 지어 어느 세션이 무엇을 건드렸는지 커밋 로그만 봐도 알 수 있게 한다.
