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
- **2026-09-03 측정**: `app-main.js` 11,836 / 13,000줄(`check:architecture-budget` 기준 91%)로 예산에 근접. `vendor-map` 청크(Leaflet, 1.1MB)는 이미 `loadLeaflet()`을 통해 `import('leaflet')` 동적 임포트로 지연 로드되고 있어(app-main.js:11132, index.html에 정적 참조 없음) 추가 code-splitting이 필요하지 않음을 확인했다 — `vite build`가 매번 찍는 "chunk larger than 700 kB" 경고는 이 청크 하나 때문이며 실제 문제가 아니다.
- **2026-09-03 후속 조치**: 순수 함수 1차 분리 완료 — 한국 공휴일/대체공휴일/24절기 계산 블록(React나 컴포넌트 상태에 전혀 의존하지 않는 ~196줄)을 `src/core/app-calendar-holidays.js`로 이동하고 app-main.js는 그 3개 공개 함수(`computeKoreanHolidaysForYear`, `getHolidayNamesForDate`, `getKoreanSolarTermsForYear`)를 import만 하도록 변경. app-main.js 11,836 → 11,681줄(90%). 빌드/전체 체크/라이브 배포·build-sha 검증까지 통과. `docs/split-plan.md` 15단계 방식(순수 함수부터, 한 번에 5~10개, 매 단계 build+check+배포 통과 후 진행) 그대로 반복 가능 — 다음 후보는 App() 대비 CalendarApp() 내부에서 실제 상태/props에 의존하지 않는 순수 헬퍼(날짜 포맷터, 정렬/필터 유틸 등)를 우선 스캔해서 같은 방식으로 계속 뺄 것. route/view 단위(청 채팅/메모/장소 뷰 자체를 별도 App shell로) 분리는 위험도가 더 높으므로(상태 공유·리렌더링 경계 재설계 필요) 실기기 회귀 확인이 가능한 세션에서 별도로 진행 권장.

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

## 7. 다음 큰 단계 (우선순위 순, 2026-09-03 갱신)

**진행 방식 원칙**: 위험도가 낮은 것부터, 한 번에 작은 단위로, 매 단계마다 `npm run build` → `npm run check:all` → 배포 → build-sha 라이브 확인까지 끝내고 다음 단계로 넘어간다. 실기기/실사용자 회귀 확인이 필요한 항목은 그렇게 표시해뒀다.

1. **(진행 중, 낮은 위험) `app-main.js` 순수 함수 계속 분리** — `docs/split-plan.md` 15단계 방식. 후보를 찾는 법: `CalendarApp()` 함수 바깥/이후에 있고 React state·props·closure에 의존하지 않는 블록을 위에서부터 훑는다. 이번 세션에 공휴일/절기 계산(196줄)을 `app-calendar-holidays.js`로 뺐다(11,836 → 11,681줄). 다음 후보 예시: 날짜/텍스트 포맷터, 색상 유틸, 정렬·필터 헬퍼.
2. **(낮은 위험) `src/main.jsx`의 화면별 lazy import 확대** — 현재 이미 admin/manual/chat/memo/places는 지연 로드 중. 부팅 시 한 번에 로드되는 `Promise.all` 목록(ui-icons, ui-confirm-dialog 등 다수)에서 초기 렌더에 필요 없는 것들을 추가로 화면 진입 시점 로드로 옮길 수 있는지 검토.
3. **(중간 위험, 실기기 확인 필요) route/view 단위 App shell 분리** — 채팅/메모/장소/캘린더 각 뷰를 `CalendarApp()`(현재 ~7,000줄 단일 컴포넌트) 밖으로 실제 분리. 상태 공유 경계와 리렌더링 범위를 다시 설계해야 해서 위 두 항목보다 리스크가 크다. 실 Firebase 인증 브라우저로 전체 회귀 확인이 가능한 세션에서 진행.
4. **(낮은 위험, 별도 작업) `chunkSizeWarningLimit` 경고 정리** — `vendor-map`(Leaflet, 1.1MB)은 이미 지연 로드라 실질 문제가 아니지만 매 빌드 로그에 경고가 찍힌다. Rollup `onwarn`으로 이 청크만 제외하거나 문서화된 예외로 명시해 로그 노이즈를 줄인다.
5. **(신규 기능, 우선순위 낮음) Playwright 기반 E2E/시각 회귀 테스트 추가** — 현재 `smoke:browser`가 있지만 커버리지가 얕다.
6. **(신규 기능, 우선순위 낮음) 알림 진단/푸시 구독 상태를 관리자 화면에 표시** — `push_subscriptions`의 `lastPushStatus`/`lastPushError`를 관리자 UI에서 조회 가능하게 하면 "알림이 안 와요" 문의 진단이 빨라짐.

## 8. 동시 세션(복수 AI) 작업 규칙

같은 날 여러 AI 세션이 동시에 이 저장소에서 작업할 때(2026-09-03처럼), 각 세션이 매 커밋마다 곧바로 `main`에 push하면 상대방이 그 사이 올린 커밋과 매번 머지해야 해서 `Merge remote-tracking branch ...` 커밋이 과도하게 쌓인다. 기능/버그 자체에는 영향이 없지만 히스토리 추적이 어려워진다.

- 여러 세션이 동시에 작업 중임을 인지했다면, 커밋마다 바로 main에 push하기보다 짧은 기능 브랜치에서 1~수 커밋을 모은 뒤 fetch → merge → push로 한 번에 반영한다.
- push 직전에는 항상 `git fetch origin main`으로 상대 세션의 새 커밋 여부를 먼저 확인한다(이미 이 저장소의 관례).
- 병합 충돌이 발생하면 파일을 통째로 덮어쓰지 말고, 두 세션이 각각 어떤 목적으로 수정했는지 diff를 읽고 의미를 보존해 병합한다.
- 브랜치 이름은 `claude/<topic>` / `grok/<topic>`처럼 세션 출처가 드러나게 지어 어느 세션이 무엇을 건드렸는지 커밋 로그만 봐도 알 수 있게 한다.
