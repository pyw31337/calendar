# V2 → 기본 URL(`?id=cw`) 덮어쓰기 핸드오프

**이 문서의 독자:** Grok / Codex / Claude / Gemini / 사람 — 세션 없이 이 저장소만 보고 V2를 기본 셸로 올리는 작업을 이어갈 수 있어야 한다.  
**최종 갱신:** 2026-09-23 (Claude, 다크 P0 완료 — 남은 블로커는 Safari 실기기 서명 하나뿐)  
**상태 한 줄:** **아직 기본 주소를 V2로 바꾸지 말 것.** V2는 `?shell=v2` 옵트인. **다크 P0는 끝났다** — Phase1–4(#736/#737/#738/#739/#741) 전부 머지, 근본원인(`.renewal-shell` 변수 재하드코딩) 수정 + 라이브 배포본에서 페이지 8개·Confirm·토스트·ShareModal까지 재QA 완료, 재발 방지 가드 테스트 추가. **남은 P0는 Safari 채팅 VV 단 하나** — 정적 코드 리뷰와 관련 자동 테스트 24개는 전부 통과했지만, 실기기(iPhone Safari) 서명은 이 샌드박스에서 할 수 없어 사람이 해야 한다. 그 서명이 끝나야 컷오버 메커닉스(§5) 착수 가능. 다크 상세: [`docs/v2-dark-mode-handoff.md`](./v2-dark-mode-handoff.md).

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

- V1(기본): `https://pyw31337.github.io/calendar/?id=cw`
- V2(옵트인): `https://pyw31337.github.io/calendar/?id=cw&shell=v2`

---

## 0. TL;DR (다른 에이전트용)

1. V2는 **크롬(셸) 스왑**이다. Firestore/데이터 경로는 V1과 같다. 데이터 포크가 아니다.
2. 게이트: `isRenewalShellEnabled()` → `shell === 'v2'` 일 때만 `RenewalAppShell` (`src/core/app-feature-flags.js`).
3. **지금은 `?id=cw`에 V2를 덮으면 안 된다.** 코드 리뷰(2026-09-23) 결론: P0 다크모드는 **완료**, P0 사파리 채팅 VV는 **실기기 서명만 미검증** (정적 리뷰·자동 테스트는 통과), (완화됨) 알림 권한 도움말은 #734로 마운트됨.
4. 컷오버는 **플래그 한 줄이 아니다.** 플래그 + 라우팅/URL 빌더 + 히스토리 가드 + `index.html` + 테스트/스모크를 같은 predicate로 맞춰야 한다. 탈출구는 한 릴리스 동안 `?shell=v1`.
5. **절대 Actions “applicator / push_files / base64 패치 워크플로”로 소스에 외과 수술하지 말 것.** #729–#732(갤러리), #733(알림)에서 CI가 도배됐다. 일반 브랜치 → `gh pr` → 머지만 사용.
6. 다음 착수 유닛: **Safari 채팅 VV 실기기 서명** (이것만 하면 컷오버 메커닉스 §5 착수 가능). 정적 코드 리뷰는 이미 끝났다 — `src/ui/v2/viewport-shell.css` + `src/ui/v2/visual-viewport-sync.js`에서 로직 결함 못 찾았고 `test/v2-scrollport.test.mjs`/`test/v2-style-isolation.test.mjs`/`test/v2-routing.test.mjs` 24개 전부 통과. 남은 건 진짜 iPhone Safari로 채팅 탭에서 키보드 open/close·스크롤·포커스·라이트박스를 눈으로 보는 것뿐 — 이 샌드박스는 WebKit이 없어서 못 함. 다크 상세는 [`v2-dark-mode-handoff.md`](./v2-dark-mode-handoff.md) (새 토글 금지 — `themeChoice` 유지 원칙은 계속 적용).

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
| `isRenewalShellEnabled()` — `src/core/app-feature-flags.js` | `URLSearchParams.get('shell') === 'v2'` |
| `renderRenewalShellIfEnabled` / `RenewalAppShell` — `src/ui/ui-app-shell-v2.js` | V2 셸 마운트; 아니면 `null` → V1 트리로 복귀 |
| `src/core/app-main.js` (~`renderRenewalShellIfEnabled` 호출부) | contexts + `globalOverlays` 전달 후 early return |
| `src/core/app-routing-state.js` | `shell === 'v2'` 일 때만 tab/sub 리맵 (`getInitialAppView` / `buildAppViewUrl`) |
| `src/index.html` 인라인 스크립트 | `pyw31337.github.io` / `localhost` / `127.0.0.1` 은 **요청한 shell 유지**(자동 v2 강제 없음). 그 외 호스트만 예전 프리뷰용으로 `shell=v2` 보정 |

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

## 3. 컷오버 판정 (2026-09-23 코드 리뷰)

**Verdict: NO — 기본 URL에 V2 덮지 말 것.**

| 주장 | 판정 | 근거 |
| --- | --- | --- |
| 기본은 V1, V2는 `?shell=v2` | 확인 | `isRenewalShellEnabled` |
| 데이터 미포크 | 확인 | V2 어댑터 = CalendarApp |
| 플래그 한 줄 + `?shell=v1` | **과장** | 라우팅·URL·히스토리·`index.html`·app-main 메모 어댑터 게이트도 동일 predicate 필요 |
| toast / confirm / upload / PIP 없음 | **예전 말 (수정됨)** | V2에 이미 remount |
| 알림 온보딩 구멍 | **과장** | `setIsNotifOnboardingOpen(true)` 호출자 없음 — V1도 사실상 죽은 코드 |
| 알림 **권한 도움말** 없음 | 확인 → **#734로 수정** | `NotificationPermissionHelpModal`을 `RenewalAppShell`에 ConfirmDialog와 같이 마운트 |
| 다크모드 깨짐 | **확인 (P0)** | V2가 `data-theme` 무시 + light hardcode + `!important` |
| Safari 채팅 키보드/VV | **확인 (P0, 기기 미검증)** | fixed shell + VV sync |
| 브라우저 매트릭스 | 미완 | smoke는 `?shell=v2` 하드코딩; Safari/Whale/Edge 수동 서명 없음 |

### 심각도별 잔여 블로커

1. **P0 — 다크모드:** V2를 V1 테마 토큰에 재연결할 때까지 기본 컷오버 금지.
2. **P0 — Safari 모바일 채팅:** 키보드 open/close, 스크롤, 포커스, 라이트박스 — 실기기.
3. **P1 — 컷오버 메커닉스 다파일 동기화** (아래 §5).
4. **P2 — CSS modern features** + 서명된 디바이스 매트릭스.
5. ~~P1 — NotificationPermissionHelpModal~~ → **완료 (#734)**.

---

## 4. 합의된 실행 순서 (바꾸지 말 것)

1. **다크 토큰 재연결** (아래 §6) — 라이트/다크가 홈·채팅·메모·장소·정산·갤러리·컨텐츠·보관함·모달에서 통과할 때까지.
2. 페이지별 라이트/다크 QA (스크린샷 유닛 루프 권장).
3. Safari iPhone 채팅 VV/키보드 검증 + 필요 시 `visual-viewport-sync` / `viewport-shell.css` 조정.
4. Whale / Edge / Firefox / Android Chrome 스모크 (`?id=cw` **shell 없이**, 컷오버 **후**).
5. **기본을 V2로** + 한 릴리스 `?shell=v1` 탈출구.
6. 안정화 후 V1 폴백 제거.

알림 권한 도움말은 #734로 §4 사이드 항목이 끝난 상태. 온보딩 모달은 **되살리지 말 것** (호출자 없음).

---

## 5. 컷오버 메커닉스 (구현 시 체크리스트 — 지금은 구현하지 말 것)

**오늘:** `shell` 없음 → V1. `shell=v2` → V2.  
**목표 탈출구 설계:** `isRenewalShellEnabled` → `get('shell') !== 'v1'` (또는 동등), **그리고** 라우팅/URL/히스토리/`index.html`/테스트가 **같은 predicate**.

건드릴 파일(최소):

1. `src/core/app-feature-flags.js` — 기본 ON, `shell=v1`만 OFF
2. `src/core/app-routing-state.js` — tab 매핑이 `=== 'v2'` 에만 묶여 있으면 기본 V2에서 탭 회귀
3. `src/ui/ui-app-shell-v2.js` — history rewrite 가드 (`params.get('shell') === 'v2'` 류)
4. `src/core/app-main.js` — memo adapter 등 `shell === 'v2'` 게이트
5. `src/index.html` — 호스트별 auto-force 재검토; `?shell=v1` 문서화
6. `test/v2-routing.test.mjs` — `shell` 없음 = V2, `shell=v1` = V1 케이스 추가
7. `scripts/browser-smoke-test.mjs` — 기본 URL이 바뀌면 하드코딩 `?shell=v2` 정리

**한 릴리스 동안 `?shell=v1` 유지 후** V1 트리/`withStickyVideo` 경로 제거는 별도 WP.

### 5.1 사전 조사 완료 (2026-09-23, Claude) — Safari 서명 후 바로 적용할 정확한 diff

**코드는 아직 건드리지 않았음** (위 "지금은 구현하지 말 것" 원칙 준수). 7개 파일 전부 실제 라인을 확인해 정확히 뭘 바꿔야 하는지만 미리 적어둠 — 서명 나오면 이 목록 그대로 적용하면 됨.

1. **`src/core/app-feature-flags.js`** (13줄, 간단) — `isRenewalShellEnabled()`의
   `return ... .get('shell') === 'v2';` → `return ... .get('shell') !== 'v1';`.
2. **`src/core/app-routing-state.js`** — 2곳:
   - `getInitialAppView` 6번째 줄: `params.get('shell') === 'v2' && params.has('tab')` →
     `params.get('shell') !== 'v1' && params.has('tab')`. (주의: 이 가드가 없으면 기본 V2에서
     `?tab=chat` 같은 딥링크가 15번째 줄의 `view` 기반 폴백으로 떨어져 무시됨 — 문서에 적힌
     "탭 회귀" 리스크가 정확히 이 지점.)
   - `buildAppViewUrl` 31번째 줄: `if (params.get('shell') === 'v2')` → `if (params.get('shell') !== 'v1')`.
3. **`src/ui/ui-app-shell-v2.js`** — 2곳 (history rewrite 가드, 3366/3388번째 줄 부근):
   `params.get('shell') === 'v2' && params.get('tab') === 'records'` →
   `params.get('shell') !== 'v1' && params.get('tab') === 'records'` (2곳 동일 패턴).
4. **`src/core/app-main.js`** — 1곳 (7018번째 줄 부근, memo adapter 게이트):
   `new URLSearchParams(window.location.search).get('shell') === 'v2'` →
   `new URLSearchParams(window.location.search).get('shell') !== 'v1'`.
5. **`src/index.html`** — **여기서 새로 발견한 실제 버그 후보**: 26-42번째 줄의 host별
   auto-force 스크립트가 `pyw31337.github.io`/`localhost`/`127.0.0.1`/`::1`이 아닌 커스텀
   도메인(다른 캘린더가 자체 도메인에 배포된 경우)에서 `missingShell = params.get('shell') !== 'v2'`
   로 판정한다. 컷오버 후에도 이 조건을 그대로 두면, 사용자가 명시적으로 `?shell=v1` 탈출구를
   써도 `!== 'v2'`가 참이 되어 **강제로 다시 `shell=v2`로 리다이렉트해버려 탈출구가 막힌다.**
   반드시 `missingShell` 판정을 `params.get('shell') === 'v1'`일 때는 건드리지 않도록 바꿔야
   함 (예: `var explicitV1 = params.get('shell') === 'v1'; ... if (!missingId && (!missingShell || explicitV1)) return; ... if (!explicitV1) params.set('shell', 'v2');`
   형태 — 정확한 최종 형태는 적용 시점에 index.html 최신본 기준으로 재작성).
6. **`test/v2-routing.test.mjs`** — 신규 케이스 2개 추가 필요: `shell` 파라미터 없음 →
   `getInitialAppView`가 V2 라우팅 규칙(예: `?tab=chat`)을 따르는지, `shell=v1` → V1(레거시
   `view` 기반) 규칙을 따르는지. **지금 추가하면 현재 구현(아직 `=== 'v2'`)과 어긋나 CI가
   깨지므로, 반드시 1-4번 구현과 같은 커밋/PR에서 함께 추가할 것.**
7. **`scripts/browser-smoke-test.mjs`** — 281/288/297/313/326번째 줄의 하드코딴 `&shell=v2`는
   컷오버 후에도 명시적으로 V2를 요청하는 것이므로 그대로 둬도 동작은 함(선택적 정리 — 기본
   URL도 이제 V2이니 `&shell=v2`를 뺀 케이스를 하나 추가하는 게 "기본이 V2다"를 실제로
   검증하는 유일한 방법).

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
4. **다크 미완 상태에서 기본 shell 플래그 뒤집기 금지.**
5. **NotificationOnboardingModal 부활 금지** (호출자 없음). 권한 도움말만 유지 (#734).
6. V2 CSS와 컷오버 플래그를 **한 PR에 섞지 말 것.** 다크 PR은 CSS(+필요 시 최소 토큰 테스트)만.

---

## 9. 다른 에이전트 작업 분담 가이드 (충돌 줄이기)

| 트랙 | 주 터치 파일 | 병행 가능? |
| --- | --- | --- |
| **A. 다크 재QA·잔여** (다음) | `src/app.css` `.renewal-shell*`, `src/ui/v2/**/*.css`, phase 테스트 | B와 `viewport-shell` 충돌 주의; C와 **절대 동시 금지** |
| **B. Safari VV/채팅** | `viewport-shell.css`, `visual-viewport-sync.js`, 채팅 셸 JS | A와 `viewport-shell.css` 충돌 주의 — 순차 권장 |
| **C. 컷오버 플래그** | `app-feature-flags.js`, `app-routing-state.js`, `ui-app-shell-v2.js` history, `app-main.js` 게이트, `index.html`, tests/smoke | **A·B 완료 후만** |
| **D. 시안 패리티 유닛** | 화면별 `screens.js` / dest chrome (다크 하드코드 건드릴 때 A와 조율) | A 진행 중이면 하드코드 색 변경은 A에 맡길 것 |

권장 브랜치: `fix/v2-dark-tokens`, `fix/v2-safari-chat-vv`, `fix/v2-default-shell` (컷오버는 마지막).

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

컷오버가 끝나면 이 문서 상단 상태를 `DONE — default is V2; ?shell=v1` 또는 `DONE — V1 removed` 로 바꾸고, 제거 WP 링크를 남긴다.

---

## 11. 빠른 재현 명령

```bash
cd /Users/pyw31337/Developer/calendar   # 사용자 Mac 기준
git fetch origin && git checkout main && git pull --ff-only
# V2만:
open 'https://pyw31337.github.io/calendar/?id=cw&shell=v2'
# 게이트 확인:
rg -n "isRenewalShellEnabled|shell === 'v2'|shell !== 'v1'" src/core src/ui/ui-app-shell-v2.js src/index.html
# 다크 가드 + 잔여 라이트 표면:
node --test test/v2-dark-tokens-phase1.test.mjs test/v2-dark-tokens-phase2.test.mjs test/v2-dark-tokens-phase3.test.mjs
grep -nE 'background(-color)?:\s*(#fff|#ffffff|#fafafc|white)\b' src/ui/v2/*.css src/app.css | head
# 다크 강제: localStorage gather_theme_preference_cw_v1 = dark
```

---

*작성: Grok Bot 세션 핸드오프 (2026-09-23). 이후 에이전트는 사실 변경 시 이 파일을 갱신할 것.*
