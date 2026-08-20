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

## P6-5 진행 (2026-08-20)
- src/core/app-utils.js 를 ESM으로 전환 (assets/ 미변경)
- src/main.jsx 가 utils까지 import
- npm run build: 모듈 8개, dist JS ~23KB (이전 ~7.5KB)
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: app-notifications → firebase-services 한 파일씩

## P6-6 진행 (2026-08-20)
- src/core/app-notifications.js 를 ESM으로 전환 (assets/ 미변경)
- src/main.jsx 가 notifications까지 import
- npm run build: 모듈 9개, dist JS ~29KB (이전 ~23KB)
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: firebase-services

## P6-7 진행 (2026-08-20)
- src/core/firebase-services.js 를 ESM으로 전환 (assets/ 미변경)
- src/main.jsx 가 firebase-services까지 import
- npm run build: 모듈 10개, dist JS ~35KB (이전 ~29KB)
- 라이브 경로 유지. Pages 전환 아직 금지.
- core 데이터/유틸/알림/파이어베이스 연결 완료
- 다음: UI 모듈 또는 app-main 브리지 (한 파일씩)

## P6-8 진행 (2026-08-20)
- 첫 UI 잎사귀: src/ui/ui-confirm-dialog.js 를 ESM export (assets/ 미변경)
- ConfirmDialog 를 src/main.jsx 에서 import
- npm run build: 모듈 11개, dist JS ~37KB
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-share-modal / ui-overlays 등 작은 UI 한 파일씩

## P6-9 진행 (2026-08-20)
- src/ui/ui-share-modal.js 를 ESM export (assets/ 미변경)
- ShareModal 을 src/main.jsx 에서 import
- npm run build: 모듈 12개, dist JS ~40KB
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-overlays 또는 ui-widgets

## P6-10 진행 (2026-08-20)
- src/ui/ui-overlays.js 를 ESM export (assets/ 미변경)
- ImageUploadOverlay / ImageProcessingOverlay / EmojiGridButton / EmojiPickerSheet
- src/main.jsx 에서 import
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-widgets 또는 ui-chat-sheets

## P6-11 진행 (2026-08-20)
- src/ui/ui-widgets.js 를 ESM export (assets/ 미변경)
- SearchResultLogRow, TikTokEmbedWidget, UrlCapsuleBadge, ParticipantPickerButton, DateCapsuleBadge
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-chat-sheets 또는 ui-user-manual

## P6-12 진행 (2026-08-20)
- src/ui/ui-chat-sheets.js 를 ESM export (assets/ 미변경)
- ChatParticipantSheet, NotificationPermissionHelpModal
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-user-manual 또는 ui-weather

## P6-13 진행 (2026-08-20)
- src/ui/ui-user-manual.js 를 ESM export (assets/ 미변경)
- UserManualOverlay
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-weather

## P6-14 진행 (2026-08-20)
- src/ui/ui-weather.js 를 ESM export (assets/ 미변경)
- WeatherBadge, WeatherLocationModal
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-side-menu 또는 ui-misc

## P6-15 진행 (2026-08-20)
- src/ui/ui-side-menu.js 를 ESM export (assets/ 미변경)
- SharedSideMenuSettings, MainSideMenu
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-misc

## P6-16 진행 (2026-08-20)
- src/ui/ui-misc.js 를 ESM export (assets/ 미변경)
- UpdateAvailableBanner, ImageShareViewer, ImageThumbRemoveButton, InlineSearchBar, MemoShareModal, ChatSideMenu
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-place-register 또는 ui-lightbox

## P6-17 진행 (2026-08-20)
- src/ui/ui-place-register.js 를 ESM export (assets/ 미변경)
- PlaceRegisterModal
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-lightbox 또는 ui-chat-gallery

## P6-18 진행 (2026-08-20)
- src/ui/ui-lightbox.js 를 ESM export (assets/ 미변경)
- LightboxInfoPanel, Lightbox
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-chat-gallery 또는 ui-remaining

## P6-19 진행 (2026-08-20)
- src/ui/ui-chat-gallery.js 를 ESM export (assets/ 미변경)
- ChatGalleryModal
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-remaining

## P6-20 진행 (2026-08-20)
- src/ui/ui-remaining.js 를 ESM export (assets/ 미변경)
- DirectChatMediaText, DeadlineDateTimePicker, PlacesSection, ImageUrlModal
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-summary-gallery 또는 ui-shared

## P6-21 진행 (2026-08-20)
- src/ui/ui-summary-gallery.js 를 ESM export (assets/ 미변경)
- SectionCountBadge, SectionToggleButton, SearchCategoryTabs, SimpleBottomSheetPicker, PhotoGallery, SummaryList
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-shared

## P6-22 진행 (2026-08-20)
- src/ui/ui-shared.js 를 ESM export (assets/ 미변경)
- 공유 UI 17개 컴포넌트 export
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-icons (아이콘 묶음)

## P6-23 진행 (2026-08-20)
- src/ui/ui-icons.js 를 ESM export (assets/ 미변경)
- 아이콘 56개 export, main에서 import *
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: 대형 뷰 파일 (places / calendar-core / chat-room 등)

## P6-24 진행 (2026-08-20)
- src/ui/ui-places.js 를 ESM export (assets/ 미변경)
- PlaceMapView, PlacesView
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-chat-room / ui-memo-view / ui-calendar-core 등 대형 뷰

## P6-25 진행 (2026-08-20)
- src/ui/ui-memo-view.js 를 ESM export (assets/ 미변경)
- MemoView
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-chat-room

## P6-26 진행 (2026-08-20)
- src/ui/ui-chat-room.js 를 ESM export (assets/ 미변경)
- ChatRoomView
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-date-modal / ui-event-modals / ui-calendar-core

## P6-27 진행 (2026-08-20)
- src/ui/ui-date-modal.js 를 ESM export (assets/ 미변경)
- DateModal
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-event-modals

## P6-28 진행 (2026-08-20)
- src/ui/ui-event-modals.js 를 ESM export (assets/ 미변경)
- AnniversaryModal, SettlementSummaryModal, PollModal
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-calendar-core / ui-admin-modals / ui-admin-dashboard

## P6-29 진행 (2026-08-20)
- src/ui/ui-calendar-core.js 를 ESM export (assets/ 미변경)
- CalendarGrid, CommentsSection, MemoCard, PollList, GlobalSearchModal, EditMessageModal
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-admin-modals, ui-admin-dashboard

## P6-30 진행 (2026-08-20)
- src/ui/ui-admin-modals.js 를 ESM export (assets/ 미변경)
- AdminModal 및 admin 검색/생성 모달들
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: ui-admin-dashboard (마지막 UI 파일)

## P6-31 진행 (2026-08-20)
- src/ui/ui-admin-dashboard.js 를 ESM export (assets/ 미변경)
- AdminDashboard — 마지막 UI 파일
- UI ESM 그래프 완료. Vite 번들 ~521KB (chunk warning 정상)
- 라이브 경로 유지. Pages 전환 아직 금지.
- 다음: app-main 브리지 또는 code-splitting / Pages 전환 준비

## P6-32 진행 (2026-08-20)
- src/core/app-main.js: assets 복사 + window.React/ReactDOM 어댑터
- src/main.jsx: React 글로벌 주입 후 core/UI/app-main 전부 import
- npm run build: 모듈 56개, dist JS ~850KB (앱 본체 포함)
- 라이브 assets/app-main.js·index.html 미변경. Pages 전환 아직 금지.
- 다음: Vite 로컬 기동 검증, CSS/Firebase 연결, 이후 Pages 전환 검토

## P6-33 진행 (2026-08-20)
- src/index.html: 폰트 + Firebase/compat CDN + confetti/lunar/qrcode (프로브 전용)
- src/main.jsx: import './app.css'
- 라이브 루트 index.html / assets/ 미변경. Pages 전환 아직 금지.
- 로컬 확인: npm run dev 후 http://localhost:5173/?id=kkot

## P6-34 진행 (2026-08-20)
- vite.config: root=src → dist/index.html 평탄화 (Pages 전환 준비)
- src/index.html 엔트리 /main.jsx
- 라이브 루트 index.html / assets/ 미변경. Pages 소스 전환 아직 금지.
- 참고: public/ 복사로 dist/assets 에 구형 파일도 같이 들어감 (전환 시 정리 가능)

## P6-35 진행 (2026-08-20)
- 빈 화면 수정: ES module import 호이스팅으로 window.React 설정이 app-main보다 늦었음
- src/react-globals.js 추가, app-main이 이를 먼저 import
- 라이브 assets/ 미변경

## P6-36 진행 (2026-08-20)
- Vite 프로브: getLocalStorage is not defined (app-notifications)
- 원인: 클래식 스크립트 공유 스코프 vs ESM 모듈 스코프
- src/core/app-notifications.js 에 로컬 getLocalStorage 헬퍼 추가 (assets/ 미변경)

## P6-37 진행 (2026-08-20)
- Vite 프로브: getActiveAvailabilities 등 classic 전역이 ESM에서 ReferenceError
- src/ui/* 에 classic-compat 심 추가 (assets/ 미변경)
- src/core/app-main bindGatherUiDeps 에 getActiveAvailabilities/getCalendarPolls/computeKoreanHolidays/FOOTER_FAMILY_LINKS 보강

## P6-38 진행 (2026-08-20)
- getKoreanSolarTermsForYear / useTapRevealedMsgId / getTrulyConfirmedMeetings 등 추가 심
- bindGatherUiDeps 키 보강 (src only)

## P6-39 진행 (2026-08-20)
- KOREAN_LUNAR_HOLIDAY_DATES 등 calendar 상수 ESM 심 추가 (src/ui only)

## P6-40 진행 (2026-08-20)
- app-notifications ESM: getActiveParticipants → GATHER_APP_UTILS 브리지

## P6-41 진행 (2026-08-20)
- getContrastTextColor / isPollClosed / formatCommentDate 포함 utils 40개 ESM 심 추가

## P6-42 진행 (2026-08-20)
- doesPlaceMatchDate 포함 app-main 전용 헬퍼 57개 ESM 심 + bindGatherUiDeps 보강

## P6-43 진행 (2026-08-20)
- src/ui-icons SVG stroke* React 속성 경고 정리
- vite base: GITHUB_PAGES=1 이면 /calendar/
- Deploy Vite Pages 워크플로 추가 (workflow_dispatch만, 자동 전환 없음)
- docs/p6-pages-switch.md 전환/롤백 문서
- 태그: safe-20260820-p6-vite-ready
- 라이브 classic 경로 유지 중

## P6-44 진행 (2026-08-20)
- memo/admin 빈 화면: app-main이 GATHER_UI_COMPONENTS를 로드 시점에 캡처 → Fallback null 고정
- 렌더 시점 resolve 래퍼로 131개 컴포넌트 수정 (src only)
- 배포: Actions → Deploy Vite Pages 수동 재실행 필요

## P6-45 진행 (2026-08-20)
- getStoredChatParticipantId: notifications 를 호출 시 window에서 resolve
- ADMIN_MESSAGE_LIVE_LIMIT / ADMIN_MEMO_LIVE_LIMIT UI 심 + deps

## P6-46 진행 (2026-08-20)
- live-smoke-check: Vite/classic 이중 모드 지원 (Vite index-*.js 마커)

## P6-47 진행 (2026-08-20)
- getStoredChatParticipantId: UI 심 + app-main 호출을 window.GATHER_APP_NOTIFICATIONS로
- firebaseDb: window.__gatherFirebaseDb + UI __fb() 브리지 (admin/memo)

## P6-48 진행 (2026-08-20)
- memo 정상 확인
- admin: PEEKALINK_HOUR_BUCKET_MS 등 상수 ESM 심 추가

## P6-49 진행 (2026-08-20)
- 제목: Vite probe 문구 제거 → 모여라 캘린더
- Deploy Vite Pages: main push 시 자동 배포 + workflow_dispatch 유지
- memo/admin 라이브 확인됨 (어드민 초기 로딩 느림은 단일 번들 ~900KB)
- 태그: safe-20260820-p6-vite-live
- 다음 후보: 코드 스플리팅으로 초기 로딩 개선, favicon, classic assets 정리

## P6-50 진행 (2026-08-20)
- publicDir → public-vite (classic assets 배포 제외, dist 2.6MB→~1.1MB)
- main.jsx 경로별 dynamic import: admin은 ui-views(~225KB) 제외
- manualChunks: vendor-react / ui-admin / ui-views / app-main
- 부트 로딩 문구 표시
- main push 시 Deploy Vite Pages 자동 (수동 불필요)

## P6-51 진행 (2026-08-20)
- admin 전용 partial load 롤백 (의존성 누락 → $e is not a function)
- 전체 UI 병렬 import 유지 + manualChunks/slim publicDir 유지

## P6-52 진행 (2026-08-20)
- isValidCalendarId 등 GATHER_APP_UTILS 별칭을 호출 시 resolve (admin $e is not a function)
- live-smoke: code-split 엔트리 작은 크기 허용, 청크 합산 검증

## P6-54 긴급 (2026-08-20)
- jhair/cw "지원하지 않는 캘린더": isAllowedCalendarId undefined 폴백 수정
- app-main 마운트를 boot 완료 후로 지연
- PUBLIC_CALENDAR_IDS에 jhair 포함
- build 후 share/ 를 dist에 복사 (Vite Pages에 share 링크 복구)

## P6-55 긴급 (2026-08-20)
- ?id=kkot&id=kkot 중복: share 리다이렉트가 search를 재첨부하던 문제 수정
- App 시작 시 URL id 정규화, changeView 시 id 단일화

## P6-56 (2026-08-20)
- 참석 명단 모바일 세로 스택 (이름 / 메모 / URL / 우상단 편집삭제)
- ≤380px 모달·헤더·URL뱃지 가독성
- 다크모드: form/modal/toast/url-badge/btn-secondary 밝은 잔여색 정리

## P6-56 (2026-08-20)
- 참석 명단 모바일 세로 스택 (이름 / 메모 / URL / 우상단 편집삭제)
- ≤380px 모달·헤더·URL뱃지 가독성
- 다크모드: form/modal/toast/url-badge/btn-secondary 밝은 잔여색 정리
