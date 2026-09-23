# V2 현재 상태

최종 갱신: 2026-09-23 15:55 KST (Phase 2 dark surfaces `fix/v2-dark-tokens-phase2`)

## 상태

- **기본 URL 컷오버: 아직 하지 않음** — `?id=cw` 는 V1, V2는 `?shell=v2` 옵트인.
- 다음 작업: **다크 Phase 2 PR** — `dest-chrome-late` / `screens` / `design` 표면 `#fff`/`#fafafc` → 테마 토큰. 이후 페이지별 라이트/다크 QA + 잔여 `responsive-audit`/`aurora-theme`.
- 상세 계획·금지사항·파일 체크리스트·에이전트 분담: **[`docs/v2-default-cutover-handoff.md`](./v2-default-cutover-handoff.md)** (다른 Grok/Codex/Claude/Gemini가 이어서 볼 문서).

## 라이브

- V1: https://pyw31337.github.io/calendar/?id=cw
- V2: https://pyw31337.github.io/calendar/?id=cw&shell=v2

## 컷오버 직전 요약 (2026-09-23)

| 항목 | 상태 |
| --- | --- |
| 데이터 경로 V1과 동일 | 확인 |
| toast / ConfirmDialog / upload / PIP / lightbox on V2 | 마운트됨 |
| NotificationPermissionHelpModal on V2 | **#734 완료** |
| 다크모드 | **P0 Phase 2 PR** — late chrome/screens/design 표면 토큰화; QA·잔여 CSS 남음 |
| Safari 채팅 키보드 / visualViewport | **P0 미검증** |
| 기본 shell 플래그 전환 | **금지** (다크·사파리 후 + `?shell=v1` 한 릴리스) |

## 최근 머지 (발췌)

- #734 알림 권한 도움말 V2 remount
- #733 알림 applicator 워크플로 삭제
- #732 갤러리 applicator 삭제
- #731 갤러리 썸네일 + Back hub 수정
- #728–#723 컨텐츠/스크롤/히어로/세그먼트/Verify 등

누적 로그: [`v2-live-progress.md`](./v2-live-progress.md)  
시안·유닛: `designv2/V2-*.md`
