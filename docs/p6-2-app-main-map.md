# P6-2 app-main.js 구역 지도

작성일: 2026-08-20
대상: src/core/app-main.js (라이브 assets/app-main.js 는 아직 동일 복사본)
동작 변경: 없음

## 분리 후보 구역

1. 상수·유틸 별칭
   - 시작: const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS
   - window.GATHER_* fallback, 비용/장소 카테고리, 공유 URL 파서

2. Firebase / REST / 구독 헬퍼
   - bindGatherFirebaseDeps
   - subscribeMessages / subscribePlaces / subscribeMemos
   - fetchSingleCloudCalendar, pushSingleCloudCalendar
   - activityLogs / places / confirmedMeetings 서브컬렉션 읽기쓰기

3. 로컬 캐시 / 백업 / ICS
   - loadLocalCache, saveLocalCache
   - createCalendarBackupPayload
   - exportCalendarConfirmedMeetingsToICS

4. 어드민 라우트 헬퍼
   - isAdminDashboardRoute
   - isAdminRestoreRoute
   - getAdminSelectedCalendarIdFromUrl

5. function App() 본체
   - 상태: calendars, activeCalId, activeView, chat/memo/places 관련 useState
   - 라우팅: const changeView = (view) => {
   - 구독 useEffect: 캘린더 문서, messages, places, memos, anniversaries
   - 뷰 분기: chat / memo / places / gallery / settlement / calendar / admin
   - 공통 오버레이: ConfirmDialog, ShareModal, Lightbox, toast, sticky video

## P6-2에서 나중에 쪼갤 파일 후보

- src/core/app-shell.js      (App 상태 + changeView)
- src/core/firebase-io.js    (구독/REST, 이미 firebase-services.js와 겹침)
- src/views/calendar-view.js
- src/views/chat-view.js
- src/views/memo-view.js
- src/views/places-view.js
- src/views/admin-view.js

지금은 파일로 쪼개지 않는다. 다음 커밋에서 src/core/app-main.js 에 구역 주석만 넣는다.
