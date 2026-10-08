# V2 현재 상태

최종 갱신: 2026-10-01 (Claude — **V1 제거**, 사용자가 아이폰 Safari 실기기로 전 페이지 검수 완료)

## 상태

- **기본 URL 컷오버: 완료.** `?id=cw` 는 V2. **V1 폴백(`?shell=v1`)과 V1 뷰 트리는 2026-10 제거됨** — 옛 `?shell=v1` 주소도 V2로 열린다.
- **다크모드 P0: 완료.** Phase1–4(#736/#737/#738/#739/#741) 전부 머지됨. Phase4가 근본 원인(`--renewal-*` 토큰 재하드코딩)을 잡았고, 라이브 배포본에서 8개 페이지 + Confirm 다이얼로그·토스트·ShareModal까지 재확인 완료. 재발 방지용 포괄 가드 테스트(`test/v2-dark-tokens-guard.test.mjs`)도 추가됨.
- **Safari 모바일: 2026-10-01 사용자가 아이폰 실기기로 전 페이지 검수 완료.** 발견된 부분은 다른 에이전트들이 수정했다.
- 다크 전용 인수인계: **[`docs/v2-dark-mode-handoff.md`](./v2-dark-mode-handoff.md)**
- 컷오버 상세(실제 적용한 diff 전부 기록): **[`docs/v2-default-cutover-handoff.md`](./v2-default-cutover-handoff.md)**

## 라이브

- V2(기본): https://pyw31337.github.io/calendar/?id=cw
- 다크 강제: `localStorage.setItem('gather_theme_preference_cw_v1','dark'); location.reload()`

## 컷오버 요약 (2026-09-23)

| 항목 | 상태 |
| --- | --- |
| 데이터 경로 V1과 동일 | 확인 |
| toast / ConfirmDialog / upload / PIP / lightbox on V2 | 마운트됨, 다크에서도 확인됨 |
| NotificationPermissionHelpModal on V2 | **#734 완료** |
| 다크모드 | **P0 완료** (Phase1–4 전부 머지 + 포괄 가드 테스트) |
| Safari 채팅 키보드 / visualViewport | **완료** — 2026-10-01 사용자 실기기 검수 |
| 기본 shell 플래그 전환 | **완료** — 게이트 자체 제거(2026-10-08): `app-feature-flags.js` 삭제, `renderRenewalShellIfEnabled()`는 항상 V2 셸을 반환 |

## 최근 머지 (발췌)

- **컷오버** — `app-feature-flags.js`/`app-routing-state.js`(2곳)/`ui-app-shell-v2.js`(2곳)/`app-main.js`/`index.html`/`test/v2-routing.test.mjs`/`scripts/browser-smoke-test.mjs`/`scripts/firebase-safety-tests.mjs` 전부 `shell !== 'v1'` predicate로 통일. `index.html`의 host auto-force가 `?shell=v1` 탈출구를 무시하던 버그도 같이 수정.
- **#744** `!important` 동일 파일 내 죽은 중복 3건 제거 (round 4)
- **#741** 다크 Phase4 — `.renewal-shell` `--renewal-*` 변수 재하드코딩 근본원인 수정 + `src/ui/v2` 잔여 리터럴 `#1e1b2e` 정리
- **#739** 다크 Phase3 `app.css` chat/memo light `!important` 제거
- **#738** 다크 Phase2b residual surfaces
- **#737** 다크 Phase2 late chrome/screens/design
- **#736** 다크 Phase1 reference/viewport/renewal-shell 상속
- #734 알림 권한 도움말 V2 remount

가드: `test/v2-dark-tokens-phase{1,2,3,4}.test.mjs`, `test/v2-dark-tokens-guard.test.mjs`, `test/v2-routing.test.mjs`

누적 로그: [`v2-live-progress.md`](./v2-live-progress.md)
시안·유닛: `designv2/V2-*.md`
