# V2 다크모드 토큰 핸드오프

**독자:** Grok / Codex / Claude / Gemini / 사람  
**최종 갱신:** 2026-09-23 (Claude, `main` @ `7dd6d374` 기준, Phase 4 픽스 완료 — PR 대기)  
**상태 한 줄:** 라이브 다크 재QA로 **핵심 원인 1건 발견·수정**: `src/app.css`의 `.renewal-shell` "V2 reference parity" 블록이 `--renewal-bg/card/text/muted`를 하드코딩 라이트 값으로 재정의해 모든 V2 페이지(채팅/메모/장소/정산/갤러리/컨텐츠/보관함) 헤더 타이틀·카드 제목·라벨 텍스트가 다크에서 거의 안 보였음 → 테마 토큰으로 되돌림(Phase 4). 로컬 빌드로 8개 화면 전부 재확인 완료. **기본 URL 컷오버 여전히 금지** — 이 PR 머지·라이브 배포 후 다시 한 번 최종 재QA 권장.

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
| **3** | **#739** | **핵심 원인 (1차):** `src/app.css` `.renewal-shell-main.is-chat` / `.is-records` 가 `#FAFAFC`/`#FFFFFF !important` 로 채팅·메모를 다시 밝게 덮음 → 토큰화. `color-mix(..., #fff)` 잔여도 정리. 가드: `test/v2-dark-tokens-phase3.test.mjs` |
| **4** | *(PR 대기)* | **핵심 원인 (2차, 더 근본적):** `src/app.css`의 `.renewal-shell { /* V2 reference parity overrides */ }` 블록이 `--renewal-bg`/`--renewal-card`/`--renewal-text`/`--renewal-muted` 를 하드코딩 라이트 hex(`#FAFAFC`/`#FFFFFF`/`#1E1B2E`/`#6B6580`)로 재정의 — 같은 파일 위쪽에서 이미 `var(--bg-primary)` 등으로 테마 인식되게 해둔 걸 이 블록이 소스 순서상 나중에 실행되며 덮어씀. `.renewal-shell-main`과 그 하위 대부분이 `color: var(--renewal-text)`를 상속하므로, 페이지 헤더 타이틀("채팅"/"메모"/"정산" 등)·메모 카드 제목·정산 "카테고리별 지출" 라벨이 다크에서 거의 안 보였던 근본 원인. `src/ui/v2/*.css`의 남은 리터럴 `color: #1e1b2e` 11곳(스크린 헤더 타이틀, place-card 이름, bottom-sheet 제목 등)도 `var(--text-main)`으로 교체. 가드: `test/v2-dark-tokens-phase4.test.mjs` |

관련 비다크: #734 NotificationPermissionHelpModal V2 remount, #733 applicator 삭제.

---

## 2. 라이브 QA 이력

### 2026-09-23 (Phase 3 이후, Phase 4 발견 계기)

로컬 빌드(`npm run build` + `vite preview`) + Playwright로 `?id=cw&shell=v2` 다크 강제 후 캘린더/채팅/메모/장소/정산/갤러리/컨텐츠/보관함 8개 화면 스크린샷. Phase 3까지는 큰 배경 표면(채팅 캔버스, 메모 카드 배경 등)이 다크로 잘 전환됐지만, **텍스트 색**이 별도 경로로 새고 있었다:

| 영역 | Phase 3 까지 | Phase 4 이후 |
| --- | --- | --- |
| 페이지 헤더 타이틀 ("채팅"/"메모"/"정산"/"장소"/"보관함") | 거의 안 보임 (다크 배경에 `#1E1B2E` 텍스트) | 흰색, 선명 |
| 메모 카드 제목 (`.v2-memo-card-title`) | 거의 안 보임 | 흰색, 선명 |
| 정산 "카테고리별 지출" 섹션 라벨 + 아이콘 | 거의 안 보임 | 흰색, 선명 |
| 장소 `place-card-row` 이름 | 거의 안 보임 | 흰색, 선명 |
| 홈 / 채팅 캔버스·말풍선 / 메모 카드 배경 / 컨텐츠 / 보관함 / 정산 지출 내역 | OK | OK (변화 없음, 이미 정상) |

원인·수정 상세는 위 표의 **Phase 4** 행 참고. 스크린샷은 이 세션의 스크래치패드에만 있고 저장소에는 커밋하지 않음 — 재현하려면 아래 §5 명령으로 직접 캡처할 것.

### 2026-09-23 라이브 QA (Phase 3 **이전**, 과거 기록)

캡처(세션 박스): `/workspace/v2-dark-qa/{home,chat,memo}-dark.png`

| 영역 | 결과 |
| --- | --- |
| 사이드바 / 캘린더 그리드 배경 | 다크 네이비 OK |
| 홈 우측 모임확정 플로팅 카드 | **밝음 (잔여)** |
| 채팅 헤더·캔버스·말풍선·입력 | **밝음** ← Phase 3로 `app.css` 수정 대상 |
| 메모 헤더·입력·카드 | **밝음** ← Phase 3 대상 |

---

## 3. 지금 할 일 (우선순위)

### P0 — Phase 4 PR 머지 + 라이브 재QA (다음 에이전트가 시작할 지점)

Phase 4는 로컬 빌드로만 검증됨 (이 샌드박스는 라이브 Firestore 접근이 간헐적으로만 되어 `?id=cw&shell=v2` 라이브 배포본 재QA를 끝까지 못 함). 다음 순서:

1. Phase 4 PR 머지 → GitHub Pages 배포 대기.
2. `?id=cw&shell=v2` + localStorage dark + reload로 8개 화면 재스크린샷, Phase 4 수정이 라이브에도 반영됐는지 확인 (§2 표와 대조).
3. 아직 밝은 게 남아있으면 DevTools로 **이긴 규칙** 찾기. 흔한 범인 (Phase 4로 가장 큰 원인은 잡았지만 남아있을 수 있는 것):
   - `src/app.css`에 `--renewal-*` 처럼 **다른 CSS 변수를 재정의하는 블록**이 소스 순서상 늦게 나오면서 앞선 테마 인식 정의를 덮는 패턴 (Phase 4가 잡은 것과 동일 유형) — `grep -n "^\s*--[a-z-]*:\s*#" src/app.css` 로 훑어볼 것
   - 인라인 `style={{ backgroundColor: '#fff' }}` / `background: white`
   - `var(--bg-card, #fff)` 폴백 (토큰 미정의 시)
   - `color-mix(..., #fff)` / `background: white` 키워드
   - V1 컴포넌트 하드코드 (`confirmed-meeting-card` 등 — 일부는 `:root[data-theme="dark"]` 오버라이드 있음)
4. Confirm·토스트·알림헬프 모달도 다크에서 스크린샷 확인 (이번 Phase 4 QA에서는 못 봄).
5. 픽스는 **작은 PR**, CSS(+가드 테스트)만. 컷오버 플래그 금지.

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
             test/v2-dark-tokens-phase3.test.mjs \
             test/v2-dark-tokens-phase4.test.mjs
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
