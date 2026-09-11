# 프론트 모듈 지도

점검일: 2026-08-28  
갱신: 2026-09-11 — `app-main.js` 분할은 [docs/app-main-split-plan.md](./app-main-split-plan.md)를 따른다. 이 지도는 로드 순서와 모듈 귀속만 설명한다.

## 로드 순서
1. `src/main.jsx`
2. `src/core/app-constants.js`, `app-config.js`, `app-calendar-data.js`, `app-chat-data.js`, `app-utils.js`, `app-notifications.js`, `firebase-services.js` (동적 import, 병렬)
3. `src/ui/*.js` (동적 import, 병렬)
4. `src/core/app-main.js` → 정적으로 `app-domain-helpers.js`, `app-firebase-data.js`를 import한 뒤 `window.__gatherStartApp()` 실행

`app-domain-helpers.js`(도메인 순수 함수)와 `app-firebase-data.js`(Firestore 읽기/쓰기/구독)는 2단계 배치에 포함되지 않고, `app-main.js`가 정적으로 import하면서 함께 번들된다 — `app-main.js`가 원래 하나였던 파일을 이후 리팩터로 분리한 결과다.

## 규칙
- 현재 라이브 기준 소스는 `src/`다.
- `assets/`는 classic 롤백/참조용으로 남아 있으므로, 대형 구조 변경 전에는 두 경로의 차이를 반드시 확인한다.
- 새 UI는 `src/ui/*.js`에 추가한다. **app-main 분할 PR과 UI PR을 섮지 말 것.**
- Firebase 저장/구독 로직은 가능한 한 `src/core/firebase-services.js` 또는 별도 service 모듈로 옮긴다.
- App 본체(`src/core/app-main.js`) 분리는 [app-main-split-plan.md](./app-main-split-plan.md) 책터를 따른다. `CalendarApp` 내부는 책터 8 이전 동결.
- 캘린더 데이터는 항상 `cal_${calendarId}` 스코프를 통과해야 하며, `kkot/cw/jhair` 하드코딩 경로를 만들지 않는다.
