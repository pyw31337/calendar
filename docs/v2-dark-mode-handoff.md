# V2 다크모드 토큰 핸드오프

**독자:** Grok / Codex / Claude / Gemini / 사람  
**최종 갱신:** 2026-09-23 16:15 KST (`main` @ `3b805904`, Phase 3 #739 머지 직후)  
**상태 한 줄:** Phase 1–3 토큰 재연결은 **머지됨**. 다음 필수 작업은 **라이브 다크 재QA → 남은 밝은 표면 픽스 → (통과 후) Safari 채팅 VV**. **기본 URL 컷오버 금지.**

컷오버 전체 계획: [`docs/v2-default-cutover-handoff.md`](./v2-default-cutover-handoff.md)  
짧은 현황: [`docs/V2-STATUS.md`](./V2-STATUS.md)

라이브:

- V2: https://pyw31337.github.io/calendar/?id=cw&shell=v2
- 다크 강제(콘솔): `localStorage.setItem('gather_theme_preference_cw_v1','dark'); location.reload()`
- 확인: `<html data-theme="dark">`

---

## 0. TL;DR

1. **새 테마 토글 만들지 말 것.** V1 `themeChoice` / `data-theme` / `gather_theme_preference_${calId}_v1` 만 사용.
2. V2는 토큰 **소비만**. `:root[data-theme="dark"]` in `src/app.css` 가 소스 오브 트루스.
3. Phase 1–3으로 큰 라이트 리셋·캔버스·`app.css` chat/memo `!important` 는 제거됨.
4. **아직 컷오버하지 말 것** (`isRenewalShellEnabled` = `shell === 'v2'` 유지).
5. **applicator / MCP `push_files`로 CSS 패치 금지.** Mac `git` + `gh pr` 만.
6. 다음 유닛: **페이지별 다크 QA 스크린샷 → 남은 밝은 카드/인라인 스타일 픽스 → 장소·정산·갤러리·컨텐츠·보관함 스윕 → Safari VV**.

---

## 1. 완료된 다크 PR (순서)

| Phase | PR | 내용 |
| --- | --- | --- |
| **1** | **#736** | `reference-*.css` / `viewport-shell` / `.renewal-shell` 가 라이트 `--bg-primary` 등을 다시 심지 않게 → V1 테마 상속. 가드: `test/v2-dark-tokens-phase1.test.mjs` |
| **2** | **#737** | `dest-chrome-late.css` / `screens.css` / `design.css` 의 `#fff`/`#fafafc` 표면 → `var(--bg-card)`/`var(--bg-primary)`. 가드: `test/v2-dark-tokens-phase2.test.mjs` |
| **2b** | **#738** | 잔여: `responsive-audit.css` / `chat-bubble-modules.css` / `segmented-toggle.css` |
| **3** | **#739** | **핵심 원인:** `src/app.css` `.renewal-shell-main.is-chat` / `.is-records` 가 `#FAFAFC`/`#FFFFFF !important` 로 채팅·메모를 다시 밝게 덮음 → 토큰화. `color-mix(..., #fff)` 잔여도 정리. 가드: `test/v2-dark-tokens-phase3.test.mjs` |

관련 비다크: #734 NotificationPermissionHelpModal V2 remount, #733 applicator 삭제.

---

## 2. 2026-09-23 라이브 QA (Phase 3 **이전**)

캡처(세션 박스): `/workspace/v2-dark-qa/{home,chat,memo}-dark.png`

| 영역 | 결과 |
| --- | --- |
| 사이드바 / 캘린더 그리드 배경 | 다크 네이비 OK |
| 홈 우측 모임확정 플로팅 카드 | **밝음 (잔여)** |
| 채팅 헤더·캔버스·말풍선·입력 | **밝음** ← Phase 3로 `app.css` 수정 대상 |
| 메모 헤더·입력·카드 | **밝음** ← Phase 3 대상 |

Phase 3 머지 후 **반드시 재QA** 할 것. Pages가 `4522e30c`(#739) 이후 배포인지 확인.

---

## 3. 지금 할 일 (우선순위)

### P0 — 다크 재QA + 잔여 픽스

1. `?id=cw&shell=v2` + localStorage dark + reload.
2. 홈 / 채팅 / 메모 / 장소 / 정산 / 갤러리 / 컨텐츠 / 보관함 / Confirm·토스트·알림헬프 스크린샷.
3. 아직 밝으면 DevTools로 **이긴 규칙** 찾기. 흔한 범인:
   - `src/app.css` `.renewal-shell*` 추가 `!important` (Phase 3이 놓친 블록)
   - 인라인 `style={{ backgroundColor: '#fff' }}` / `background: white`
   - `var(--bg-card, #fff)` 폴백 (토큰 미정의 시)
   - `color-mix(..., #fff)` / `background: white` 키워드
   - V1 컴포넌트 하드코드 (`confirmed-meeting-card` 등 — 일부는 `:root[data-theme="dark"]` 오버라이드 있음)
4. 픽스는 **작은 PR**, CSS(+가드 테스트)만. 컷오버 플래그 금지.

### P0 — Safari 모바일 채팅 (다크와 병행 가능하나 viewport 파일 충돌 주의)

- `viewport-shell.css`, visualViewport sync, 키보드 open/close, 스크롤, 포커스, 라이트박스.
- 실기기 iPhone Safari 서명 전까지 컷오버 금지.

### P1 — 컷오버 메커닉스 (다크+Safari **후**)

- `app-feature-flags.js`, `app-routing-state.js`, `ui-app-shell-v2.js` history, `app-main.js`, `index.html`, tests/smoke.
- 한 릴리스 `?shell=v1` 탈출구.
- 상세: 컷오버 핸드오프 §5.

---

## 4. 건드릴 파일 / 건드리지 말 파일

| 해도 됨 (다크) | 지금은 금지 |
| --- | --- |
| `src/app.css` 중 `.renewal-shell*` 색/배경만 | `isRenewalShellEnabled` / 기본 shell 플래그 |
| `src/ui/v2/**/*.css` | `.github/workflows/apply-*` applicator |
| `test/v2-dark-tokens-phase*.test.mjs` | MCP `push_files`로 대형 패치 |
| 핸드오프/STATUS 문서 | NotificationOnboardingModal 부활 |

---

## 5. 검증 명령

```bash
cd /Users/pyw31337/Developer/calendar
git fetch origin && git checkout main && git pull --ff-only
node --test test/v2-dark-tokens-phase1.test.mjs \
             test/v2-dark-tokens-phase2.test.mjs \
             test/v2-dark-tokens-phase3.test.mjs
# 의심 표면 검색:
grep -nE 'background(-color)?:\s*(#fff|#ffffff|#fafafc|white)\b' src/ui/v2/*.css src/app.css | head
grep -nE 'renewal-shell-main\.is-chat|is-records' src/app.css | head
```

수동: 설정 테마 토글 또는 localStorage 키 위 참고.

---

## 6. 에이전트 작업 방식 (사용자 선호)

- 한국어, 유닛 크기: 배포 → 라이브 스크린샷 vs 기대 → 짧은 브리프 → 픽스 → PR.
- **혼자 긴 executor 루프 금지** — 상태/PR 링크를 자주 남길 것. 사용자: “또 혼자 도는 거 아니야?” 에 민감.
- 액센트 = 시안 **보라** (V1 파란 잔여 제거). 세그먼트 포커스 = 보라 **배경 채움**.
- vivid + glassy 유지. URL/데이터 규칙 유지.

---

## 7. 이 문서 갱신 규칙

작업 착수·PR 머지·QA 판정 바뀔 때마다 상단 **최종 갱신 / 상태 한 줄**과 [`V2-STATUS.md`](./V2-STATUS.md) 다크 행을 같이 고친다.
