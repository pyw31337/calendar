# V2 현재 상태

최종 갱신: 2026-09-23 (Claude, PR #741 — 로컬+라이브 프리뷰 재QA 완료, 머지 대기)

## 상태

- **기본 URL 컷오버: 아직 하지 않음** — `?id=cw` 는 V1, V2는 `?shell=v2` 옵트인.
- **다크 Phase1–3 코드 머지됨** (#736/#737/#738/#739). **Phase4는 PR #741, ready-for-review, 머지 대기** — `src/app.css`의 `.renewal-shell` 블록이 `--renewal-bg/card/text/muted`를 하드코딩 라이트 값으로 재정의해 모든 V2 페이지 헤더 타이틀·카드 제목이 다크에서 거의 안 보이던 근본 원인을 잡음. PR #741의 GitHub Pages 프리뷰(라이브)에서 8개 화면 재QA 완료. 다음: **PR #741 머지 → Confirm/토스트/알림헬프 모달 다크 QA → Safari 채팅 VV**.
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
| 다크모드 | **P0 Phase1–3 머지, Phase4 = PR #741 (ready, 머지 대기)** — 헤더 타이틀/카드 제목 근본 원인 잡고 라이브 프리뷰까지 재QA 완료, 모달/토스트 확인만 남음 |
| Safari 채팅 키보드 / visualViewport | **P0 미검증** |
| 기본 shell 플래그 전환 | **금지** (다크·사파리 후 + `?shell=v1` 한 릴리스) |

## 최근 머지 (발췌)

- **PR #741 (머지 대기)** 다크 Phase4 — `.renewal-shell` `--renewal-*` 변수 재하드코딩 근본원인 수정 + `src/ui/v2` 잔여 리터럴 `#1e1b2e` 정리, 라이브 프리뷰 재QA 완료
- **#739** 다크 Phase3 `app.css` chat/memo light `!important` 제거
- **#738** 다크 Phase2b residual surfaces
- **#737** 다크 Phase2 late chrome/screens/design
- **#736** 다크 Phase1 reference/viewport/renewal-shell 상속
- #734 알림 권한 도움말 V2 remount
- #733 알림 applicator 삭제
- #731 갤러리 썸네일 + Back hub

가드: `test/v2-dark-tokens-phase{1,2,3,4}.test.mjs`

누적 로그: [`v2-live-progress.md`](./v2-live-progress.md)  
시안·유닛: `designv2/V2-*.md`
