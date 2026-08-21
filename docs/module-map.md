# 프론트 모듈 지도

점검일: 2026-08-21

## 로드 순서
1. `src/main.jsx`
2. `src/core/app-constants.js`, `app-config.js`, `app-calendar-data.js`, `app-chat-data.js`, `app-utils.js`, `app-notifications.js`, `firebase-services.js`
3. `src/ui/*.js`
4. `src/core/app-main.js` → `window.__gatherStartApp()`

## 규칙
- 현재 라이브 기준 소스는 `src/`다.
- `assets/`는 classic 롤백/참조용으로 남아 있으므로, 대형 구조 변경 전에는 두 경로의 차이를 반드시 확인한다.
- 새 UI는 `src/ui/*.js`에 추가한다.
- Firebase 저장/구독 로직은 가능한 한 `src/core/firebase-services.js` 또는 별도 service 모듈로 옮긴다.
- App 본체(`src/core/app-main.js`)는 route/view 단위로 계속 분리한다.
- 캘린더 데이터는 항상 `cal_${calendarId}` 스코프를 통과해야 하며, `kkot/cw/jhair` 하드코딩 경로를 만들지 않는다.
