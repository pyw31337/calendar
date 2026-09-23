# V2 현재 상태

최종 갱신: 2026-09-23 16:15 KST (`main` @ `3b805904`, 다크 Phase1–3 머지)

## 상태

- **기본 URL 컷오버: 아직 하지 않음** — `?id=cw` 는 V1, V2는 `?shell=v2` 옵트인.
- **다크 Phase1–3 코드 머지됨** (#736/#737/#738/#739). 다음: **라이브 다크 재QA → 잔여 밝은 표면 → Safari 채팅 VV**.
- 다크 전용 인수인계: **[`docs/v2-dark-mode-handoff.md`](./v2-dark-mode-handoff.md)**
- 컷오버 계획·금지사항: **[`docs/v2-default-cutover-handoff.md`](./v2-default-cutover-handoff.md)**

## 라이브

- V1: https://pyw31337.github.io/calendar/?id=cw
- V2: https://pyw31337.github.io/calendar/?id=cw&shell=v2
- 다크 강제: `localStorage.setItem('gather_theme_preference_cw_v1','dark'); location.reload()`

## 컷오버 직전 요약 (2026-09-23)

| 항목 | 상태 |
| --- | --- |
| 데이터 경로 V1과 동일 | 확인 |
| toast / ConfirmDialog / upload / PIP / lightbox on V2 | 마운트됨 |
| NotificationPermissionHelpModal on V2 | **#734 완료** |
| 다크모드 | **P0 Phase1–3 코드 완료** — 재QA·잔여 표면·홈 모임카드 확인 중 |
| Safari 채팅 키보드 / visualViewport | **P0 미검증** |
| 기본 shell 플래그 전환 | **금지** (다크·사파리 후 + `?shell=v1` 한 릴리스) |

## 최근 머지 (발췌)

- **#739** 다크 Phase3 `app.css` chat/memo light `!important` 제거
- **#738** 다크 Phase2b residual surfaces
- **#737** 다크 Phase2 late chrome/screens/design
- **#736** 다크 Phase1 reference/viewport/renewal-shell 상속
- #734 알림 권한 도움말 V2 remount
- #733 알림 applicator 삭제
- #731 갤러리 썸네일 + Back hub

가드: `test/v2-dark-tokens-phase{1,2,3}.test.mjs`

누적 로그: [`v2-live-progress.md`](./v2-live-progress.md)  
시안·유닛: `designv2/V2-*.md`
