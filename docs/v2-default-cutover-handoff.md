# V2 → 기본 URL(`?id=cw`) 덮어쓰기 핸드오프

**이 문서의 독자:** Grok / Codex / Claude / Gemini / 사람 — 세션 없이 이 저장소만 보고 V2를 기본 셸로 올리는 작업을 이어갈 수 있어야 한다.  
**최종 갱신:** 2026-09-23 (Claude, **컷오버 실행 완료** — 사용자의 명시적 지시로 Safari 실기기 서명 게이트를 건너뛰고 진행)  
**상태 한 줄:** **V2가 기본 셸이다.** `isRenewalShellEnabled()` = `shell !== 'v1'` (부재 시 V2), `?shell=v1`이 한 릴리스 동안 유지되는 V1 폴백. §5에 사전 조사해둔 7개 파일 diff를 그대로 적용해 완료: `app-feature-flags.js`/`app-routing-state.js`(2곳)/`ui-app-shell-v2.js`(2곳)/`app-main.js`/`index.html`(host auto-force가 `?shell=v1`을 무시하던 버그 포함 수정)/`test/v2-routing.test.mjs`(신규 케이스 2개)/`scripts/browser-smoke-test.mjs`(기본 URL 검증 추가). `scripts/firebase-safety-tests.mjs`의 낡은 기대값 1건도 같이 수정. **Safari 채팅 VV 실기기 서명은 사용자가 추후 직접 진행** — 정적 코드 리뷰·자동 테스트 24개는 이미 통과했고, 문제 발견 시 `?shell=v1`로 즉시 되돌릴 수 있다는 전제로 이 순서를 바꿨다. 다크 상세: [`docs/v2-dark-mode-handoff.md`](./v2-dark-mode-handoff.md).

관련 문서:

| 문서 | 역할 |
| --- | --- |
| **이 문서** | 기본 URL 덮어쓰기(컷오버) 전용 계획·현황·금지사항 |
| [`docs/V2-STATUS.md`](./V2-STATUS.md) | V2 전체 현황 요약 (짧게 유지; 컷오버 디테일은 여기로 링크) |
| [`docs/design-renewal-handoff.md`](./design-renewal-handoff.md) | 리뉴얼 전반 인계 (시안·IA·불변조건) |
| [`docs/product-renewal-master-plan.md`](./product-renewal-master-plan.md) | 제품 “왜/무엇을” — 충돌 시 **마스터플랜 우선** |
| [`designv2/V2-GLASS-SYSTEM.md`](../designv2/V2-GLASS-SYSTEM.md) | vivid + glassy 시각 컨셉 |
| [`designv2/V2-MOBILE-IA-PLAN.md`](../designv2/V2-MOBILE-IA-PLAN.md) | 모바일 IA |
| [`designv2/V2-UNIT-LOOP.md`](../designv2/V2-UNIT-LOOP.md) | 유닛 배포→시안 대조 루프 |
| [`CLAUDE.md`](../CLAUDE.md) | 캘린더 격리·저장소 금지 규칙 |

라이브 확인 URL:

- V2(기본): `https://pyw31337.github.io/calendar/?id=cw`
- V1(폴백 탈출구, 한 릴리스 동안 유지): `https://pyw31337.github.io/calendar/?id=cw&shell=v1`

---

## 0. TL;DR (다른 에이전트용)

1. V2는 **크롬(셸) 스왑**이다. Firestore/데이터 경로는 V1과 같다. 데이터 포크가 아니다.
2. 게이트: `isRenewalShellEnabled()` → `shell !== 'v1'` 이면(부재 포함) `RenewalAppShell` (`src/core/app-feature-flags.js`). **V2가 기본.**
3. **컷오버 완료 (2026-09-23).** 다크모드 P0는 끝났고, Safari 채팅 VV 실기기 서명은 사용자의 명시적 지시로 순서를 바꿔 건너뛰었다 — 문제 발견 시 `?shell=v1`로 즉시 되돌릴 수 있다는 전제. 알림 권한 도움말은 #734로 이미 마운트됨.
4. 컷오버는 플래그 한 줄이 아니었다 — 플래그 + 라우팅/URL 빌더(2곳) + 히스토리 가드(2곳) + `app-main.js` + `index.html` + 테스트/스모크까지 **같은 predicate(`shell !== 'v1'`)** 로 전부 맞췄다 (§5 참고, 실제 적용한 diff 기록됨). 탈출구는 한 릴리스 동안 `?shell=v1`.
5. **절대 Actions “applicator / push_files / base64 패치 워크플로”로 소스에 외과 수술하지 말 것.** #729–#732(갤러리), #733(알림)에서 CI가 도배됐다. 일반 브랜치 → `gh pr` → 머지만 사용.
6. 다음 착수 유닛: **Safari 채팅 VV 실기기 서명 (사용자가 직접 진행 예정)** → 문제 없으면 §5 하단 "한 릴리스 후" 정리(V1 트리/`withStickyVideo` 제거)로. 문제 발견 시 원인 파일은 `src/ui/v2/viewport-shell.css` / `src/ui/v2/visual-viewport-sync.js`(정적 리뷰는 이미 통과) 우선 확인. 다크 상세는 [`v2-dark-mode-handoff.md`](./v2-dark-mode-handoff.md) (새 토글 금지 — `themeChoice` 유지 원칙은 계속 적용).

---

## 1. 제품 맥락 (왜 덮어쓰기를 하는가)

- V2(`?shell=v2`)는 BentoPink / glassy 시안을 따르는 **전용 앱 셸**이다. 클래스는 `.renewal-shell.v2-design`.
- 사용자(박영우)는 V2를 기본 주소 `?id=cw`에 올리고, 같은 시기에 **다크모드**를 V2에도 쓰길 원한다.
- 제약(사용자·마스터플랜 공통):
  - 기존 **서비스 URL 표기·데이터 처리 규칙 유지**
  - 기능 삭제 금지 (크롬만 교체)
  - 액센트는 **시안 보라** (V1 파란 액센트 잔여 제거)
  - 세그먼트/스위치 포커스 = **보라 배경 채움** (언더라인 아님)
  - 시각 컨셉 = **vivid + glassy** (Apple-like)
  - 작업 방식 = **유닛 크기** 배포 → 라이브 스크린샷 vs 시안 → 브리프 → 수정

---

## 2. 아키텍처 (에이전트가 건드릴 때)

### 2.1 진입 / 게이트

| 심볼 / 파일 | 역할 |
| --- | --- |
| `isRenewalShellEnabled()` — `src/core/app-feature-flags.js` | `URLSearchParams.get('shell') !== 'v1'` (**V2가 기본**) |
| `renderRenewalShellIfEnabled` / `RenewalAppShell` — `src/ui/ui-app-shell-v2.js` | V2 셸 마운트; `shell=v1`이면 `null` → V1 트리로 복귀 |
| `src/core/app-main.js` (~`renderRenewalShellIfEnabled` 호출부) | contexts + `globalOverlays` 전달 후 early return |
| `src/core/app-routing-state.js` | `shell !== 'v1'` 이면 tab/sub 리맵 (`getInitialAppView` / `buildAppViewUrl`) |
| `src/index.html` 인라인 스크립트 | `shell` 파라미터는 전혀 건드리지 않음(더 이상 강제할 필요 없음 — V2가 이미 기본). 비-github.io/localhost 호스트에서 `id` 기본값(`cw`)만 채움 |

### 2.2 데이터

V2 어댑터(`buildRenewal*Context`)가 CalendarApp 상태 + 기존 뷰(`ChatRoomView`, `DateModal`, 갤러리/메모/장소 등)를 재사용한다. **별도 Firestore 레이어 없음.**

### 2.3 스타일

- V2 CSS 전부 `src/ui/v2/` (대략 11k+ 줄). 무거운 파일: `dest-chrome-late.css`, `screens.css`, `design.css`, `aurora-theme.css`, `viewport-shell.css`, `segmented-toggle.css`.
- V1 테마: `src/app.css`의 `:root[data-theme="dark"]` + `src/core/app-shell-state.js` / `useDisplayPreferences` / `applyThemeChoice`.
- **문제:** `src/ui/v2/**` 에서 `data-theme` 매치 **0**. `reference-*.css` 등이 `.v2-*` 아래 `--bg-primary: #FAFAFC`, `--bg-card: #FFF` 로 **라이트 리터럴을 다시 심음**. 대략 light hex ~207, `!important` ~3500+ (2026-09-23 측정). 설정 다크 토글은 켜져도 V2 크롬이 무시한다.

### 2.4 뷰포트 / 채팅

- `src/ui/v2/viewport-shell.css` — 셸을 visualViewport 높이에 고정, `html:has(.v2-design)` 오버플로 락.
- `visual-viewport-sync.js` (또는 동등 모듈) — 키보드 휴리스틱; 사파리 실기기 미검증.
- 모던 CSS 의존(대략): `:has(` ~360, `color-mix` ~20, `dvh` ~45 — 구형 Safari 위험, 기기 매트릭스 미서명.

---

## 3. 컷오버 판정 — **2026-09-23, 사용자 지시로 실행됨**

이 절의 "NO" 판정은 다크모드가 깨져 있던 시점의 코드 리뷰 결론이었다. 다크모드 P0가 끝난 뒤, 아래 표의 "Safari 채팅 키보드/VV" 행만 실기기 미검증으로 남았는데, 사용자가 "그 부분은 추후 내가 직접 확인할 테니 스킵하고 끝까지 진행해달라"고 명시적으로 지시해 그 게이트를 넘기고 §5를 실행했다. **문제가 발견되면 `?shell=v1`로 즉시 V1로 되돌릴 수 있다는 전제.**

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| 기본은 V2, `?shell=v1`은 탈출구 | 확인 (컷오버 후 상태) | `isRenewalShellEnabled` |
| 데이터 미포크 | 확인 | V2 어댑터 = CalendarApp |
| 플래그 한 줄 + `?shell=v1` | **과장이었음, 지금은 전부 반영됨** | 라우팅·URL·히스토리·`index.html`·app-main 메모 어댑터 게이트 전부 동일 predicate로 갱신 완료 (§5) |
| toast / confirm / upload / PIP 없음 | **예전 말 (수정됨)** | V2에 이미 remount |
| 알림 온보딩 구멍 | **과장** | `setIsNotifOnboardingOpen(true)` 호출자 없음 — V1도 사실상 죽은 코드 |
| 알림 **권한 도움말** 없음 | 확인 → **#734로 수정** | `NotificationPermissionHelpModal`을 `RenewalAppShell`에 ConfirmDialog와 같이 마운트 |
| 다크모드 깨짐 | ~~확인 (P0)~~ → **완료** | Phase1–4 전부 머지 (§6) |
| Safari 채팅 키보드/VV | **확인, 실기기 미검증 — 사용자가 추후 직접 확인** | fixed shell + VV sync, 정적 리뷰·자동 테스트는 통과 |
| 브라우저 매트릭스 | 미완 (P2, 컷오버를 막지 않음) | Safari/Whale/Edge 수동 서명 없음 |

### 심각도별 잔여 블로커 (2026-09-23 갱신)

1. ~~P0 — 다크모드~~ → **완료.**
2. **Safari 모바일 채팅 실기기 서명** — 사용자가 추후 직접 진행. `?shell=v1`로 즉시 롤백 가능하다는 전제로 컷오버보다 먼저 막던 게이트는 해제했다.
3. ~~P1 — 컷오버 메커닉스 다파일 동기화~~ → **완료** (아래 §5).
4. **P2 — CSS modern features** + 서명된 디바이스 매트릭스 (여전히 미완, P2라 컷오버를 막지 않음).
5. ~~P1 — NotificationPermissionHelpModal~~ → **완료 (#734)**.

---

## 4. 실행 순서 (2026-09-23, 사용자 지시로 순서 변경됨)

1. ~~다크 토큰 재연결~~ (§6) → **완료.**
2. ~~페이지별 라이트/다크 QA~~ → **완료.**
3. ~~Safari iPhone 채팅 VV/키보드 검증~~ → **사용자가 추후 직접 진행 (컷오버보다 뒤로 미룸).** 원래 계획은 이 항목이 5번보다 먼저였으나, 사용자가 "사파리 확인은 추후에 내가 할테니 그 부분 스킵하고 끝까지 완수해달라"고 명시적으로 지시해 5번을 먼저 진행했다.
4. Whale / Edge / Firefox / Android Chrome 스모크 (`?id=cw`, 컷오버 **후**) — 아직 미완, 사람이 직접 여러 브라우저에서 확인 필요.
5. **기본을 V2로** + 한 릴리스 `?shell=v1` 탈출구 → **완료** (§5 참고, 실제 적용한 diff 전부 기록됨).
6. 안정화 후 V1 폴백 제거 — **아직 하지 말 것.** 최소 3, 4번(Safari 실기기 + 크로스브라우저)이 사람 손으로 확인되기 전까지는 `?shell=v1` 탈출구를 유지한다.

알림 권한 도움말은 #734로 §4 사이드 항목이 끝난 상태. 온보딩 모달은 **되살리지 말 것** (호출자 없음).

---

## 5. 컷오버 메커닉스 — **적용 완료 (2026-09-23)**

**이전(2026-09-23 오전):** `shell` 없음 → V1. `shell=v2` → V2.  
**지금:** `isRenewalShellEnabled()` = `get('shell') !== 'v1'` — `shell` 없으면 V2, `shell=v1`이면 V1. 라우팅/URL 빌더/히스토리 가드/`index.html`/테스트가 전부 이 predicate로 통일됨.

건드린 파일 (전부 적용 완료, 커밋은 `feat/v2-default-shell-cutover` 브랜치):

1. `src/core/app-feature-flags.js` — `isRenewalShellEnabled()`가 `get('shell') === 'v2'` → `get('shell') !== 'v1'`로. `window` 없을 때 기본 반환값도 `false` → `true`로 (기본이 V2이므로).
2. `src/core/app-routing-state.js` — `getInitialAppView`(6번째 줄 부근)와 `buildAppViewUrl`(31번째 줄 부근) 2곳 모두 동일하게 predicate 교체.
3. `src/ui/ui-app-shell-v2.js` — history rewrite 가드 2곳(`records` 허브 스냅 로직) 동일 predicate로 교체.
4. `src/core/app-main.js` — memo adapter 게이트(`window.__gatherV2MemoCommentsChange` 등록 조건) 동일 predicate로 교체.
5. `src/index.html` — **실제 버그 발견 + 수정:** host별 auto-force 스크립트가 `missingShell = params.get('shell') !== 'v2'`로 판정해서, 컷오버 후 비-github.io 호스트에서 사용자가 명시적으로 `?shell=v1`을 써도 강제로 다시 `shell=v2`로 리다이렉트해 탈출구를 막는 버그였다. 이제 이 스크립트는 `shell` 파라미터를 **아예 건드리지 않고** (V2가 이미 기본이라 강제할 필요 자체가 없어짐), 여전히 필요한 유일한 역할인 "`id` 파라미터 기본값 채우기"만 한다.
6. `test/v2-routing.test.mjs` — 기존 `'default routes ignore V2 tab/sub parameters'` 테스트(구 V1 기본 동작 가정)를 새 기본 동작(shell 없음 = V2)으로 갱신하고, `shell=v1` 탈출구가 진짜로 레거시 라우팅으로 돌아가는지 검증하는 신규 테스트를 별도로 추가. 22개 테스트 전부 통과.
7. `scripts/browser-smoke-test.mjs` — 뷰포트별 루프 맨 앞에 `?id=cw`(shell 파라미터 없음)로 접속해도 `.renewal-shell`이 렌더되는지 확인하는 기본 URL 컷오버 검증 스텝 추가. 기존 `&shell=v2` 하드코딩 케이스들은 명시적 V2 요청이라 그대로 둬도 무해해서 유지.
8. `scripts/firebase-safety-tests.mjs` — `buildAppViewUrl`의 낡은 기대값 1건(“shell 없으면 V1처럼 tab/sub 없는 URL”)이 새 기본 동작과 어긋나 실패하는 걸 발견해, 새 기본값(tab/sub 포함)을 기대하는 케이스로 교체하고 `shell=v1`일 때는 여전히 tab/sub 없이 나가는지 검증하는 케이스를 추가.

검증: `npm run lint`, `npm run check:all`(lint+101 tests+isolation/design/live-source/보안/사이즈/아키텍처 가드), `npm run safety:test`, `npm run regression:test`(프로덕션 빌드) 전부 통과.

**한 릴리스 동안 `?shell=v1` 유지** (사람이 Safari 실기기 + 크로스브라우저 확인 전까지 최소). 그 후 V1 트리/`withStickyVideo` 경로 제거는 별도 WP.

---

## 6. 다크모드 (완료 — Phase1–4 전부 머지 + 재발방지 가드)

**전용 문서:** [`docs/v2-dark-mode-handoff.md`](./v2-dark-mode-handoff.md) — 여기보다 그쪽을 우선 갱신.

### 원칙 (불변)

- **새 토글 금지.** V1 `themeChoice` / `data-theme="dark"` / `gather_theme_preference_*_v1`.
- V2는 토큰 소비만. `src/app.css` `:root[data-theme="dark"]` = 소스 오브 트루스.

### 코드 상태 (2026-09-23)

| Phase | PR | 상태 |
| --- | --- | --- |
| 1 reference/viewport/`.renewal-shell` 상속 | #736 | 머지 |
| 2 late chrome/screens/design 표면 | #737 | 머지 |
| 2b audit/bubbles/segmented | #738 | 머지 |
| 3 `app.css` is-chat/is-records `!important` | #739 | 머지 |
| 4 `.renewal-shell` `--renewal-*` 변수 재하드코딩 근본원인 + `src/ui/v2` 잔여 리터럴 `#1e1b2e` | **#741** | 머지, 라이브 프리뷰 재QA 완료 |

Phase 4는 Phase 1–3이 놓친 **더 근본적인 원인**이었다: `src/app.css`의 `.renewal-shell { /* V2 reference parity overrides */ }` 블록이 `--renewal-bg`/`--renewal-card`/`--renewal-text`/`--renewal-muted`를 하드코딩 라이트 hex로 재정의하고 있었고, `.renewal-shell-main`을 포함한 대부분의 V2 콘텐츠가 `color: var(--renewal-text)`를 상속하므로 모든 페이지 헤더 타이틀·메모 카드 제목·정산 라벨이 다크에서 거의 안 보였다. 상세는 [`v2-dark-mode-handoff.md`](./v2-dark-mode-handoff.md) §1 Phase 4 행·§2 참고.

### 다음 (다크는 끝, 이제 전부 Safari 차례)

1. ✅ PR #741 머지, 라이브 재QA 완료 (8개 화면 + Confirm/토스트/ShareModal).
2. ✅ 홈 모임확정 카드 — `src/ui/v2/*.css` 전체에서 리터럴 hex 없음을 정적으로 재확인, 잔여 문제 없음.
3. **다음 유닛은 다크가 아니라 Safari 채팅 VV 실기기 서명** (§4 참고) — 그것만 끝나면 컷오버 메커닉스(§5) 착수.

가드 테스트: `test/v2-dark-tokens-phase{1,2,3,4}.test.mjs`, `test/v2-dark-tokens-guard.test.mjs` (특정 셀렉터가 아니라 "`--renewal-*`/`--bg-*`/`--text-*` 토큰이 리터럴 hex가 되면 무조건 실패"하는 일반 규칙이라 5번째 재발도 막는다)

---

## 7. 최근 완료된 작업 (컷오버 직전 맥락, 2026-09-23)

대표 PR (최신 → 과거, 발췌):

| PR | 내용 |
| --- | --- |
| **#741** | 다크 Phase4 — `.renewal-shell` `--renewal-*` 변수 재하드코딩 근본원인 수정 + `src/ui/v2` 잔여 리터럴 `#1e1b2e` 정리, 재발방지 가드 테스트 |
| **#739** | 다크 Phase3 — `app.css` chat/memo `#FAFAFC/#FFFFFF !important` → 테마 토큰 |
| **#738** | 다크 Phase2b — responsive-audit / bubbles / segmented |
| **#737** | 다크 Phase2 — dest-chrome-late / screens / design 표면 |
| **#736** | 다크 Phase1 — reference-* / viewport / `.renewal-shell` 표면 토큰 상속 |
| **#734** | V2에 `NotificationPermissionHelpModal` remount (일반 코드 PR) |
| **#733** | 알림 applicator 워크플로 삭제 (CI 도배 정리) |
| **#732** | 갤러리 thumbs one-shot applicator 삭제 |
| **#731** | 갤러리 썸네일 resolver 재설계 + Back이 records hub로 안 떨어지게 |
| **#728** | 컨텐츠 포스터 유지, 지역 모달, 보관함/헤더 |
| **#727** | 캘린더 홈·정산 세로 스크롤 복구 |
| **#726** | 히어로 퀵내비 ≤460px column, 검색/설정 히트영역 |
| **#725** | Verify toast/confirm 가드 정합 |
| **#724** | 세그먼트 보라 fill + V1 파란 액센트 스윕 |
| **#723** | 모바일 히어로 퀵내비 밀도 |
| **#721** | visualViewport 헤더/컴포저 + 라이트박스 |

더 긴 누적 로그: [`docs/v2-live-progress.md`](./v2-live-progress.md), `designv2/` 기획 문서들.

### 알려진 잔여 리스크 (#731 부근)

- photoIndex에 죽은/404 행이 있으면 썸네일 회색 셀 가능 (서버 인덱스 정리와 별개).
- `RecordsOverviewPane` / `tab=records` 허브 경로는 코드에 남아 있을 수 있음 — Back 가드는 넣었지만 `sub=all` 등으로 직접 진입은 가능.

---

## 8. 절대 하지 말 것 (에이전트 사고 방지)

1. **`.github/workflows/apply-*.yml` 같은 “소스에 패치 심는” applicator 추가/재도입 금지.**  
   증상: 깨진 YAML이 `push` 이벤트마다 빨간 X. 해결은 파일 삭제 PR뿐 (#732, #733).
2. **박스 MCP `create_or_update_file` / `push_files`로 대형 `app-main.js` 한 줄 교체 금지** — path 문자열이 본문으로 들어가 원격 브랜치가 오염됨. Mac에서 `git` + `gh`로만 푸시.
3. **URL/데이터 규칙·캘린더 격리 깨기 금지** (`CLAUDE.md`, `scripts/check-calendar-isolation.mjs`).
4. ~~다크 미완 상태에서 기본 shell 플래그 뒤집기 금지~~ → 다크 완료 + 사용자 지시로 컷오버 실행됨. **이제부터는 `?shell=v1` 탈출구를 사람이 Safari/크로스브라우저 확인 전까지 실수로 제거하지 말 것.**
5. **NotificationOnboardingModal 부활 금지** (호출자 없음). 권한 도움말만 유지 (#734).
6. V2 CSS와 컷오버 플래그를 **한 PR에 섞지 말 것** (이번 컷오버 PR은 플래그·라우팅 로직 전용이고 CSS는 건드리지 않았음 — 이 규칙 유지). 다크/디자인 PR은 CSS(+필요 시 최소 토큰 테스트)만.

---

## 9. 다른 에이전트 작업 분담 가이드 (충돌 줄이기)

**A(다크)·C(컷오버 플래그)는 완료됨.** 지금 남은 트랙:

| 트랙 | 주 터치 파일 | 병행 가능? |
| --- | --- | --- |
| ~~A. 다크 재QA·잔여~~ | — | **완료** |
| **B. Safari VV/채팅 실기기 서명** (사람이 진행) | 문제 발견 시 `viewport-shell.css`, `visual-viewport-sync.js`, 채팅 셸 JS | 단독 진행 |
| ~~C. 컷오버 플래그~~ | — | **완료** — `feat/v2-default-shell-cutover` |
| **D. 시안 패리티 유닛** | 화면별 `screens.js` / dest chrome | 단독 진행 가능 |
| **E. 크로스브라우저 스모크** | Whale/Edge/Firefox/Android Chrome 수동 확인, `scripts/browser-smoke-test.mjs` | B와 독립적으로 진행 가능 |

컷오버 자체는 끝났으므로, 앞으로 이 저장소를 만지는 에이전트는 **기본적으로 V2 코드(`src/ui/v2/**`, `src/ui/ui-app-shell-v2.js`)가 라이브 트래픽 전체가 보는 화면**임을 기억할 것 — 더 이상 "옵트인 프리뷰"가 아니다.

검증 최소:

```bash
node --test test/v2-routing.test.mjs
npm run lint   # 변경 범위
# 컷오버/대규모 CSS 후:
npm run check:all
```

수동: `?id=cw&shell=v2` + 설정 테마 전환 + (가능하면) iPhone Safari 채팅.

---

## 10. “지금 하고 있는 일” 갱신 규칙

이 문서를 고칠 때 맨 위 **최종 갱신** 날짜·SHA·상태 한 줄을 반드시 바꾼다.  
짧은 요약은 [`docs/V2-STATUS.md`](./V2-STATUS.md)에도 한 블록만 미러링한다.  
유닛 완료 로그는 [`docs/v2-live-progress.md`](./v2-live-progress.md)에 append.

**상태: `DONE — default is V2; ?shell=v1` fallback.** V1 트리 제거(`DONE — V1 removed`)는 Safari 실기기 + 크로스브라우저 확인 후 별도 WP.

---

## 11. 빠른 재현 명령

```bash
cd /Users/pyw31337/Developer/calendar   # 사용자 Mac 기준
git fetch origin && git checkout main && git pull --ff-only
# 기본(V2):
open 'https://pyw31337.github.io/calendar/?id=cw'
# V1 폴백:
open 'https://pyw31337.github.io/calendar/?id=cw&shell=v1'
# 게이트 확인:
rg -n "isRenewalShellEnabled|shell !== 'v1'" src/core src/ui/ui-app-shell-v2.js src/index.html
node --test test/v2-routing.test.mjs
# 다크 가드 + 잔여 라이트 표면:
node --test test/v2-dark-tokens-phase1.test.mjs test/v2-dark-tokens-phase2.test.mjs test/v2-dark-tokens-phase3.test.mjs test/v2-dark-tokens-phase4.test.mjs test/v2-dark-tokens-guard.test.mjs
grep -nE 'background(-color)?:\s*(#fff|#ffffff|#fafafc|white)\b' src/ui/v2/*.css src/app.css | head
# 다크 강제: localStorage gather_theme_preference_cw_v1 = dark
```

---

*작성: Grok Bot 세션 핸드오프 (2026-09-23). 이후 에이전트는 사실 변경 시 이 파일을 갱신할 것.*
