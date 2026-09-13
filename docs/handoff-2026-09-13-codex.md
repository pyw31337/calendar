# 인수인계서 — 2026-09-13 (Claude → Codex)

토큰 소진으로 이 세션(Claude)에서 Codex로 작업을 넘긴다. 아래는 지금까지 진행한 것과
남은 것, 그리고 이어받을 때 바로 참고할 수 있는 상세 정보다.

## 배경: 사용자 지시 (여전히 유효, standing instruction)

- "묻지 말고 멈춤없이 계속 진행해줘" — `?shell=v2` UI/UX 리뉴얼 작업을 질문 없이 계속 진행.
  단, **U10~U14(`CalendarApp` 내부 훅 분리)는 예외 — 유닛을 콕 집은 명시적 지시 없이는
  절대 시작하지 않음** (CLAUDE.md에 명시된 규칙, 포괄적 지시로도 우회 불가).
- PR babysitting: 구독 중인 모든 PR을 CI 그린/머지 가능 상태로 계속 이끌 것. 머지 충돌은
  다른 PR이 머지될 때마다 즉시 해소.
- **가장 최근 사용자 요청 (아직 미완료)**: "나머지 PR 모두 드래프트 해제해서 자동으로
  머지되게 해줘" — 열려있는 모든 PR을 draft 해제 + auto-merge 활성화해서, 앞으로는 CI
  통과 시 사용자가 수동으로 클릭하지 않아도 자동 머지되게 해달라는 요청.

## 완료된 것

### PR #624 (`codex/renewal-wp08-calendar-settings`) 머지 충돌 해소 — 완료, 검증 완료, 푸시 완료

`origin/main`(PR #620 검색 기능이 이미 머지된 상태)과의 3-way 머지 충돌을
`src/ui/ui-app-shell-v2.js`(10개 충돌 블록), `src/core/app-main.js`(어댑터 호출부 1곳),
`docs/wp01-app-shell-progress.md`(체인지로그 섹션 순서) 세 파일에서 전부 해소했다.

- 두 기능(WP-08 검색 `#620` 머지분, WP-08 캘린더 설정 `#624`)이 `RenewalAppShell`에
  거의 동일한 구조의 셸-내비게이션 조립 로직(`calendarSettingsExtra`/`searchExtra`,
  각각 독립적인 로컬 date-modal state)을 추가했던 게 충돌 원인 — **양쪽 다 보존**하는
  방식으로 해소(하나가 다른 하나를 대체하지 않도록).
- `MoreModalsHost`가 `AdminModal`과 `GlobalSearchModal` 둘 다 렌더하도록 시그니처/구조
  분해/렌더 분기/`openMoreModalById` 트리거 맵을 전부 병합.
- 병합 과정에서 lint 에러 발견·수정: `buildRenewalMoreContext`가 반환하는 객체에
  `focusChatMessage`/`chatMessages`/`setActiveLightbox`가 중복 선언돼 있던 것을
  발견해서 제거(이미 위쪽에 한 번 선언돼 있었음 — 검색 기능이 먼저 추가해둔 것).
- `docs/wp01-app-shell-progress.md` 병합 중 **기존에 이미 있던 버그**(장소/WP-06
  섹션이 헤더 없이 통째로 중복 붙어있던 것)를 발견해서 같이 정리(중복 텍스트 블록 삭제).
- 검증: `npm run lint` / `npm run check:app-main-inventory`(`CalendarApp: lines
  409-8108 (7700/7700)` 확인) / `npm run check:all` / `npm run safety:test` /
  `npm run regression:test`(빌드 포함) **전부 통과**.
- Playwright 헤드리스로 `?shell=v2&tab=more`(캘린더 설정 클릭), `?shell=v2&tab=calendar`
  (헤더 검색 아이콘 클릭), `records&sub=places`/`memo`/`archive` 회귀 체크 — 전부
  `ERR_INSUFFICIENT_RESOURCES` 0건 확인(`ERR_CONNECTION_RESET`만 있음 — 이건 이
  샌드박스 환경이 외부 네트워크를 막아놔서 나는 것으로, 매 라운드 반복 확인된 정상
  현상).
- `git commit --no-edit` + `git push origin codex/renewal-wp08-calendar-settings`
  완료 (커밋 `958f1b5`). PR #624의 최신 head가 이 커밋이고, GitHub CI(check_suite)도
  이 커밋 기준으로 완료됨을 알림으로 확인함.

## 미완료 — 다음에 바로 이어서 할 일

### 1. GitHub API rate limit으로 막혀있는 작업: draft 해제 + auto-merge 활성화

사용자 요청("나머지 PR 모두 드래프트 해제해서 자동으로 머지되게 해줘")을 처리하려고
`mcp__github__update_pull_request`(draft: false)를 호출했는데, **"API rate limit
already exceeded for user ID 20960020"** 에러가 여러 차례(3분 간격, 10분 간격으로
재시도해도 계속) 발생해서 아직 하나도 처리 못했다. 이 rate limit이 언제 풀릴지는
확인 못한 상태 — Codex가 이어받으면 먼저 재시도해보고, 계속 막히면 사용자에게
"GitHub API 요청 한도 초과로 잠시 후 재시도 필요"라고 알려줄 것.

**대상 PR 5개 (전부 현재 draft:true, open 상태)**:

| PR # | 브랜치 | 제목 |
|---|---|---|
| 624 | `codex/renewal-wp08-calendar-settings` | WP-08: Wire 더보기/캘린더 설정 to real AdminModal |
| 623 | `codex/renewal-wp06-content-pane` | WP-06: Wire 기록/콘텐츠 subtab to real ContentView |
| 622 | `codex/renewal-wp06-media-pane` | WP-06: Wire 기록/사진·영상 subtab to real ChatGalleryModal |
| 621 | `codex/renewal-wp06-history-pane` | WP-06: Wire 기록/보관함 subtab to real HistoryView + fix shell-wide remount bug |
| 548 | `split/u3-search-helpers` | refactor: U3 -- extract search/highlight helpers to app-search.js |

**각 PR마다 할 일**:
1. `mcp__github__update_pull_request`로 `draft: false` 설정 (ready for review 전환).
2. `mcp__github__enable_pr_auto_merge` 호출 (머지 방법은 레포 기본값 사용 — 별도
   지정 안 해도 됨). PR이 draft 상태면 auto-merge가 걸리지 않으므로 반드시 1번을
   먼저 해야 함.
3. 각 PR의 현재 CI 상태(`mcp__github__pull_request_read` method `get_status` 또는
   `get_check_runs`)를 확인해서, 이미 CI가 그린이고 머지 가능하면 auto-merge가 바로
   발동해서 머지될 것 — 그건 정상 동작이니 놀라지 말 것.
4. `#548`은 다른 4개(WP-06/WP-08 계열)와 무관한 훨씬 오래된 리팩터 PR(`U3` 검색
   헬퍼 추출)이다 — 사용자가 "나머지 PR 모두"라고 했으므로 포함은 시켰지만, 혹시
   머지 충돌이 있는지 먼저 `mergeable_state`를 확인하고, 충돌이 있으면 이 세션에서
   써온 것과 같은 패턴(아래 "병합 충돌 해소 패턴" 참고)으로 처리할 것.

### 2. 이 PR들이 auto-merge로 실제 머지될 때 — 연쇄 충돌 대응 준비

이 5개 PR은 서로 겹치는 파일(`src/ui/ui-app-shell-v2.js`, `src/core/app-main.js`
의 어댑터 호출 1줄, `docs/wp01-app-shell-progress.md`)을 건드리기 때문에, 하나가
머지되면 나머지가 자동으로 머지 충돌 상태(`mergeable_state: dirty`)가 될 가능성이
매우 높다 — **auto-merge를 켜놔도 충돌이 나면 GitHub이 자동으로 머지하지 못하고
막힌다.** 그러니 auto-merge를 켜는 것만으로 끝나는 게 아니라:

- 이 세션이 계속 각 PR을 구독(`subscribe_pr_activity`) 상태로 유지하면서, 머지
  충돌 알림이 오면 즉시 아래 패턴으로 해소하고 다시 push해야 자동 머지가 이어진다.
- **이번 세션에서 이미 3라운드 반복 검증된 병합 충돌 해소 패턴** (그대로 재사용):
  1. `git status`(안전 확인) → `git checkout <branch>` → `git fetch origin main`
     → `git merge origin/main --no-edit`.
  2. `src/ui/ui-app-shell-v2.js` 충돌: 양쪽의 `buildRenewalRecordsContext`/
     `buildRenewalMoreContext`가 구조분해하는 deps를 합치고, 반환하는 prop 객체도
     합치고(둘 다 유지), 양쪽의 Pane 컴포넌트(`PlacesPane`/`MemoPane`/`HistoryPane`
     /`MediaPane`/`ContentPane` 등)를 전부 유지, `RecordsPane`의 subTab 분기 체인에
     양쪽 다 추가.
  3. `src/core/app-main.js`의 어댑터 호출 1줄: 인자가 더 많은 쪽을 기준으로, 다른
     쪽에서 새로 추가된 필드를 올바른 위치의 deps 객체 인자에 병합.
  4. `docs/wp01-app-shell-progress.md`: 두 섹션 다 같은 날짜(append-only 로그)이므로
     먼저 작성된 쪽을 브랜치 쪽 섹션보다 앞에 오도록 재배치, 충돌 마커 삭제. **주의:
     `sed`로 지울 때 앞 문단의 마지막 줄이 실수로 같이 삭제되는 경우가 이번 세션에서
     여러 번 있었음 — 병합 후 반드시 각 섹션의 마지막 줄이 온전한지 `Read`로 재확인**.
  5. `git add -A` → 전체 검증 재실행: `npm run lint`, `npm run check:app-main-inventory`
     (반드시 `CalendarApp: lines 409-8108 (7700/7700)`로 나와야 함 — 숫자가 다르면
     뭔가 잘못 병합된 것), `npm run check:all`, `npm run safety:test`,
     `npm run regression:test`(빌드 포함).
  6. `vite preview --port 4173`를 백그라운드로 띄우고, Playwright 스크립트로
     새로 머지된 기능 + 이 브랜치 자체 기능이 정상 렌더되는지 확인(`domcontentloaded`
     + 수동 timeout 방식 사용 — `networkidle`은 이 샌드박스에서 행 걸림, 절대 쓰지
     말 것). `ERR_INSUFFICIENT_RESOURCES` 0건이면 통과(`ERR_CONNECTION_RESET`은
     이 환경의 정상적인 네트워크 차단 현상이므로 무시). 확인 후 임시 스크립트 삭제,
     `pkill -f "vite preview --port 4173"`(exit code 144 나오는 게 정상).
  7. `git commit --no-edit` → `git push origin <branch>`.

### 3. `?shell=v2` 리뉴얼 계획 자체의 남은 작업

- U10~U14(`CalendarApp` 내부 훅 5개 분리: `useChatMessageWindow`,
  `useMemoCollections`, `useGalleryIndexBindings`, `createCalendarPhotoActions`,
  뷰 JSX 본체) — **사용자가 유닛을 콕 집어 명시적으로 지시하기 전까지는 절대
  시작하지 말 것.** "알아서 진행해" 같은 포괄적 지시로도 우회 불가 (CLAUDE.md 규칙).
- U8(`bindGatherUiDeps` 카탈로그화)도 보류 중 — 이건 U10~U14처럼 승인 필수는
  아니지만, 검증 없이 안전하게 쪼갤 수 없다고 판단해서 미착수 상태.
- 위 5개 PR이 전부 머지되고 나면, `docs/design-renewal-handoff.md`와
  `docs/wp01-app-shell-progress.md`를 다시 읽고 다음 슬라이스(남은 더보기/기록
  하위 화면 중 아직 실제 연결 안 된 것이 있는지)를 확인할 것.

## 참고: 반복해서 확인된 환경 특이사항

- 이 세션의 네트워크는 샌드박스로 막혀있어서 `ERR_CONNECTION_RESET`이 항상 몇 건
  뜨는데, 이건 알려진 정상 현상이다. `ERR_INSUFFICIENT_RESOURCES`만 실제 버그
  신호로 취급할 것.
- `pkill -f "vite preview --port 4173"` 실행 시 exit code 144가 나오는 것도
  이 도구가 자기 자신의 백그라운드 서브셸을 죽이면서 나는 정상 현상 — 무해함,
  다만 실행 후 `git status`로 작업 트리 상태는 항상 재확인할 것.
- GitHub MCP 도구가 가끔 "API rate limit already exceeded"를 던진다 — 짧게(3분)
  재시도해서 안 풀리면 더 길게(10분+) 기다렸다가 재시도할 것. 급하게 반복 호출하면
  오히려 한도 회복이 늦어질 수 있으니 주의.

## 커밋 서명/PR 본문 관련

- 커밋 메시지/PR 본문에 모델 식별자(예: 특정 Claude 버전명)를 넣지 말 것 — 채팅
  응답에서만 언급 가능.
- 이 세션에서 붙인 attribution 형식(commit trailer, PR footer)은 세션마다
  다를 수 있으니, Codex는 자기 세션에 지정된 attribution 규칙을 따를 것 — 이
  문서에 있는 이전 커밋(`958f1b5`)의 trailer를 그대로 복사하지 말 것.
