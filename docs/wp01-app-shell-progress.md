# WP-01 진행 기록 — 기능 플래그 앱 셸

`docs/product-renewal-master-plan.md` §9 WP-01의 진행 로그. WP-01 자체의 작업 지시는 마스터플랜에
있으며, 이 문서는 "무엇을 언제 했고 왜 그렇게 했는지"만 기록한다.

**더 넓은 맥락(시안 갈래, 기능 인벤토리, 다음 작업자 체크리스트)은 `docs/design-renewal-handoff.md`를
먼저 읽을 것** — 이 문서는 그 안의 섹션 4를 더 상세히 푼 것이다.

## 2026-09-13: IA 방향 결정 — 마스터플랜 우선

목업 세션(Claude Design 캔버스)에서 먼저 만든 사이드바 시안은 기존 6개 저장 출처별 메뉴
(캘린더/채팅/메모/갤러리/장소/정산)를 그대로 사이드바로 옮긴 구조였다. 이는
`docs/product-renewal-master-plan.md` §4.1이 지정한 목표 IA — 5탭(캘린더/대화/기록/정산/더보기),
메모·갤러리·장소는 "기록" 탭 하위로 통합 — 와 어긋난다.

사용자에게 확인한 결과: **마스터플랜의 5탭 IA를 따른다.** 목업의 사이드바 디자인(글래스 아이콘,
접기/펼치기, 색상 토큰 등 시각적 디테일)은 그대로 재사용하되, 항목 구성만 6개 저장소 메뉴 →
5개 목적지(캘린더/대화/기록/정산/더보기)로 다시 짠다. 메모/사진·영상/장소는 "기록" 탭 안의
서브탭이 된다.

## 2026-09-13: WP-01 1차 슬라이스 — 플래그 뒤 인벤트 셸

**커밋 범위:** 라우팅/상태 모델이나 실제 데이터 연결 없이, "5탭 내비게이션 셸이 존재하고
플래그로만 보인다"는 것만 증명하는 최소 슬라이스.

추가/변경한 파일:

- `src/core/app-feature-flags.js` (신규) — `isRenewalShellEnabled()`. `?shell=v2` URL 쿼리
  파라미터만 읽는다. **localStorage/sessionStorage에 아무것도 쓰지 않는다** — CLAUDE.md가
  금지하는 "새 localStorage 영속화 경로 추가"에 해당하지 않도록, 탭을 닫거나 파라미터를 빼면
  즉시 원래 상태로 돌아가는 URL 전용 플래그로 설계했다.
- `src/ui/ui-app-shell-v2.js` (신규) — `RenewalAppShell` 컴포넌트 + `renderRenewalShellIfEnabled`
  어댑터 함수. 모바일은 하단 고정 5탭 내비, `>=1024px`는 좌측 사이드 레일로 전환 (마스터플랜
  §4.1: "데스크톱은 동일한 목적지를 좌측 또는 상단 내비게이션으로"). 각 탭은 지금은
  플레이스홀더(빈 상태 안내문)만 렌더링 — 실제 캘린더/채팅/기록/정산 데이터 연결은 WP-03~07의
  몫이다.
- `src/core/app-main.js` — `CalendarApp`의 최종 `return` 앞에 **한 줄**만 추가:
  `renderRenewalShellIfEnabled(...)`가 null이 아니면 그 값을 반환. 모든 훅이 이미 실행된
  지점(React hooks 규칙 준수)이자 기존 `activeView` 분기(채팅/갤러리 전체화면 등)보다 앞이라,
  플래그가 켜지면 어떤 기존 뷰로도 새지 않는다.
  - `docs/app-main-split-units.md`가 `CalendarApp`을 7700줄로 동결해 둔 상태라 — 실제로 이번
    확인 시점 기준 정확히 7700줄이었다 — 로직 대부분을 `ui-app-shell-v2.js`의
    `renderRenewalShellIfEnabled` 헬퍼로 밀어내고 `app-main.js` 안에는 호출 한 줄만 남겼다.
    (처음에는 주석 포함 11줄을 넣었다가 `check:app-main-inventory`에 걸려서 이렇게 줄였다 —
    같은 실수를 반복하지 않도록 여기 기록해 둔다.)
- `src/app.css` — 파일 맨 끝에 `renewal-shell-*` 접두사로만 이루어진 새 섹션 추가. 기존 선택자는
  하나도 건드리지 않았다 (`app.css`는 마스터플랜 §0.5가 지목한 최고 충돌 위험 파일).

**검증 (모두 통과):**

```
npm run lint
npm run check:all         # check:app-main-inventory 포함, CalendarApp 정확히 7700/7700
npm run safety:test
npm run regression:test   # npm run build 포함
```

`vite preview`로 헤드리스 확인: `?shell=v2` 없는 기본 URL은 스크린샷/HTML 길이가 이전과 동일
(여전히 기존 4탭+햄버거 구조, Firebase 로딩 스켈레톤 — 이 세션 네트워크 제약으로 실데이터는
못 불러오지만 셸 자체는 그대로). `?shell=v2`를 붙이면 5탭 셸이 모바일 하단 내비 / 데스크톱
사이드 레일로 정상 전환됨을 390px와 1400px 양쪽에서 확인.

## 2026-09-13: WP-01 2차 슬라이스 — URL 기반 탭 라우팅

**커밋 범위:** 탭 전환을 `?tab=` 쿼리파라미터 + History API에 연결. 실제 데이터 연결은 여전히
범위 밖(WP-03~07).

- `readTabFromLocation()` — `?tab=`을 읽고, 없거나 알 수 없는 값이면 `calendar`로 폴백.
- `writeTabToLocation(tabId, { push })` — `?id=`/`?shell=v2` 등 다른 쿼리파라미터는 그대로 두고
  `tab`만 갱신. 탭 버튼 클릭은 `push: true`(히스토리 항목 추가 — 마스터플랜 §4.1 "브라우저
  뒤로가기는 탭 내부 상세 → 탭 루트 → 이전 브라우저 위치 순"에 맞춰 뒤로가기로 탭을 한 단계씩
  되짚어갈 수 있게 함), 최초 마운트 시 잘못된 `?tab=` 교정은 `push: false`(히스토리 항목을
  늘리지 않음).
- `RenewalAppShell`의 `activeTab` 초기값을 `readTabFromLocation()`으로 바꾸고, 마운트 시
  `popstate` 리스너를 달아 뒤로/앞으로 가기에 반응하도록 함.
- 검증: `?id=kkot&shell=v2`로 시작 → 탭 클릭마다 URL이 `&tab=chat` 등으로 바뀜 → 뒤로가기 두
  번으로 탭이 한 단계씩 되짚어짐 → `?tab=records`를 직접 넣고 새로 열면 기록 탭으로 바로 진입.
  기본(플래그 없음) 경로는 HTML 길이 동일, 콘솔 에러 없음 재확인.
- `npm run lint`/`check:all`/`safety:test`/`regression:test` 전부 통과 (`app-main.js`는 이번
  슬라이스에서 건드리지 않아 7700줄 예산과 무관).

**아직 다루지 않은 것**: 탭 "내부 상세" 단계(예: 채팅 안의 특정 메시지, 기록 안의 특정
사진/장소)는 아직 없어서(전부 플레이스홀더) 그 단계의 뒤로가기 규칙은 검증되지 않았다 — 실제
데이터가 들어가는 WP-03~07에서 각 탭이 자체적으로 더 깊은 URL 상태(예: `?tab=records&item=...`)
를 쌓을 때 이 패턴(다른 파라미터 보존 + push/replace 구분)을 그대로 재사용할 것.

## 2026-09-13: WP-01 3차 슬라이스 — "기록" 탭 서브탭

**커밋 범위:** 기록 탭에 서브탭 6개(전체/메모/사진·영상/장소/보관함/콘텐츠 —
`docs/design-renewal-handoff.md` §2 매핑표 그대로) 추가. 여전히 플레이스홀더 콘텐츠뿐, 실제
데이터는 WP-06 몫.

- `RECORDS_SUBTABS` 배열 + `readRecordsSubTabFromLocation()`/`writeLocationState(tab, sub,
  opts)`. 기존 `writeTabToLocation`을 `writeLocationState`로 확장해서 tab과 sub를 한 번에
  다룬다 — 2차 슬라이스에서 예고했던 "이 패턴을 그대로 확장" 그 자리.
- `?sub=`는 `tab=records`일 때만 의미가 있고, 다른 탭으로 전환하면 자동으로 URL에서 빠진다
  (무관한 탭의 URL에 남아있지 않도록).
- `RecordsPane` 컴포넌트: 서브탭 칩 행 + 그 아래 플레이스홀더. `PlaceholderPane`은 나머지 4개
  플랫 탭에서 그대로 사용.
- 검증: `?tab=records`로 직접 진입 → 서브탭 6개 전부 렌더 → 메모/장소 클릭마다 `&sub=`가
  바뀜 → 정산 탭으로 전환하면 `sub` 파라미터가 사라짐 → 뒤로가기하면 `tab=records&sub=places`로
  복귀. 기본(플래그 없음) 경로 HTML 길이 동일, 콘솔 에러 없음.
- `npm run lint`/`check:all`/`safety:test`/`regression:test` 전부 통과 (`app-main.js` 미변경,
  7700줄 예산 그대로).

## 2026-09-13: WP-01 4차 슬라이스 — "더보기" 탭 메뉴

**커밋 범위:** 더보기 탭에 `docs/design-renewal-handoff.md` §2 매핑표의 7개 항목(검색/공유/
기념일 설정/캘린더 설정/앱 설정/사용자 매뉴얼/관리자 진입)을 세로 리스트로 추가. 여전히
플레이스홀더 동작뿐 — 각 항목을 실제 화면/기존 기능으로 연결하는 건 다음 슬라이스 몫.

- `MORE_ITEMS` 배열 + `MORE_ITEM_ICONS` 맵 + `MoreItemIcon`/`MorePane` 컴포넌트. `RecordsPane`과
  같은 패턴(플랫 리스트, 선택 상태만 로컬 `useState`로 토글)으로 최소 슬라이스를 유지했다 —
  기록 탭과 달리 URL 상태(`?sub=` 같은)는 아직 추가하지 않았다: 더보기의 각 항목은 "탭 안
  필터"가 아니라 각기 다른 화면/다이얼로그로 이어질 것이라, 그 목적지가 실제로 정해지기 전에
  URL 스킴을 먼저 설계하면 다시 갈아엎을 가능성이 높다고 판단해 보류했다.
- `RenewalAppShell`의 렌더 분기에 `activeTab === 'more'` 케이스 추가 (`RecordsPane`과 같은 자리,
  `PlaceholderPane` 폴백 앞).
- `app.css`에 `renewal-shell-more*` 접두사로만 이루어진 섹션 추가 (리스트/행/아이콘/셰브런/
  하단 안내문). 기존 선택자는 하나도 건드리지 않았다.
- 검증: `?tab=more`로 직접 진입 → 7개 항목 전부 렌더 확인(Playwright로 `.renewal-shell-more-item`
  텍스트 7개 모두 확인: 검색/공유/기념일 설정/캘린더 설정/앱 설정/사용자 매뉴얼/관리자 진입).
  기본(플래그 없음) 경로 HTML 길이 이전 슬라이스와 동일 패턴 유지, 콘솔 에러 없음(이 환경의
  `ERR_CONNECTION_RESET`/`networkidle` 타임아웃은 Firebase 네트워크 차단에 의한 것으로
  `docs/renewal-baseline.md`에 이미 기록된 환경 고유 제약).
- `npm run lint`/`check:all`/`safety:test`/`regression:test` 전부 통과 (`app-main.js` 미변경,
  `check:app-main-inventory`가 `CalendarApp: lines 409-8108 (7700/7700)`으로 그대로 확인).

**아직 다루지 않은 것**: 각 항목을 눌렀을 때의 실제 동작(관리자 진입 → 기존 관리자 대시보드,
사용자 매뉴얼 → 기존 `ui-user-manual.js`, 캘린더 설정/앱 설정/기념일 설정/공유는 각각 기존
설정 UI 재사용 또는 신규 설계, 검색은 아예 신규 설계 — `docs/design-renewal-handoff.md` §4.5
참고)은 다음 WP-01(또는 그 이후) 슬라이스 몫이다.

## 다음 단계 (착수 안 함)

- **기존 상단 4탭 → 5탭 매핑/치환**: 마스터플랜은 "기존 상단 4개 기능 탭은 기능 플래그 뒤에서
  새 내비게이션으로 대체한다"고 명시하지만, 이번 슬라이스는 완전히 별도 리턴 경로라 기존 4탭
  코드는 전혀 건드리지 않았다. 대체(교체)가 아니라 신규 추가 상태 — 다음 WP-01 슬라이스에서
  다룬다.
- **목업 사이드바의 시각 디테일 이식**: 지금 `RenewalAppShell`은 무채색 최소 스타일이다.
  Claude Design 목업(글래스 아이콘 버튼, 접기/펼치기, 브랜드 그라디언트 등)의 톤을 그대로
  가져오는 건 WP-02(디자인 토큰) 이후로 미뤘다 — 토큰이 먼저 정리돼야 하드코딩 색상이 늘지
  않는다.
- **더보기 탭 각 항목의 실제 연결**: 5차 슬라이스(아래)에서 7개 중 4개(공유/기념일 설정/사용자
  매뉴얼/관리자 진입)를 실제로 연결했다. 나머지 3개(검색/앱 설정/캘린더 설정)는 왜 이번에
  포함하지 않았는지 5차 슬라이스 항목의 "아직 다루지 않은 것"을 참고.
- **실제 데이터 연결**: WP-03(캘린더 홈) → WP-04(날짜 허브) → WP-05(채팅) → WP-06(기록) →
  WP-07(정산) 순서로, 마스터플랜 §10 Phase B/C를 따른다.

## 2026-09-13: WP-01 5차 슬라이스 — "더보기" 항목 실제 연결 (4/7)

**커밋 범위:** 4차 슬라이스에서 리스트만 존재하던 더보기 항목 중 4개를 기존 화면에 실제로
연결. 나머지 3개(검색/앱 설정/캘린더 설정)는 의도적으로 이번 범위에서 뺐다 — 이유는 아래
"아직 다루지 않은 것" 참고.

- **핵심 발견**: `renderRenewalShellIfEnabled`가 `CalendarApp`의 최종 `return`보다 앞에서
  조기 반환하기 때문에, `CalendarApp`의 기존 `isShareOpen`/`isAnniversariesOpen`/`isGuideOpen`
  같은 state가 구동하는 모달 JSX(ShareModal/AnniversaryModal/UserManualOverlay 등)는 그
  `return` 아래쪽에 있어서 `?shell=v2`에서는 아예 렌더되지 않는다. 그래서 4차 슬라이스의
  `buildRenewalMoreActions`가 그 state의 setter를 호출해도 실제로는 아무 일도 안 일어나는
  조용한 버그였다 — Playwright로 "앱 설정" 클릭 후 `.modal-overlay` 개수를 세어보다가 발견.
- **해결책**: `CalendarApp`의 state를 재사용하는 대신, `RenewalAppShell`이 어떤 모달이 열려
  있는지를 스스로 관리하는 로컬 `openMoreModal` state를 두고, 실제 모달 컴포넌트(ShareModal/
  AnniversaryModal/UserManualOverlay)는 `MoreModalsHost`가 `bindUiComponentAliases`
  (`src/core/app-ui-wrappers.js`, U1a/b/c가 만든 `window.GATHER_UI_COMPONENTS` pass-through
  헬퍼)로 직접 렌더링한다. `app-main.js`가 이미 쓰는 것과 완전히 같은 지연로드/등록 메커니즘을
  재사용하는 것이라 별도 번들링이나 중복 로직이 생기지 않는다.
  - 사용자 매뉴얼은 `window.__gatherLoadManualUi()`, 기념일 설정은
    `window.__gatherLoadEventUi()`(`src/main.jsx`, `CalendarApp`의 `withEventUi`가 쓰는 것과
    동일한 지연로더)를 열기 전에 기다린다. 공유는 원래 코드도 지연로드 없이 바로 열길래
    그대로 뒀다.
- `buildRenewalMoreActions` → `buildRenewalMoreContext(calendar, deps)`로 이름 변경 + 재설계:
  `calendar` 인자(어댑터가 이미 받는 두 번째 인자, 재조회 없음)로 `!calendar`면 토스트만 띄우고
  아무 것도 열지 않는 자체 가드(`requireLoadedCalendar`)를 갖췄다 — `CalendarApp`의
  `guardLoadedCalendar`에 더 이상 의존하지 않는다. 반환값은 `modalProps`(각 모달에 그대로
  넘길 props)와 `onSelect*`/`onOpenAdmin` 트리거 함수들.
- `app-main.js`의 어댑터 호출 한 줄도 이 새 모양에 맞게 deps를 바꿨다: `guardLoadedCalendar`,
  `setIsShareOpen`, `setIsAnniversariesOpen`, `setIsAppSettingsOpen`, `setIsGuideOpen`,
  `setIsAdminOpen`, `setAdminInitialTab`는 더 이상 필요 없어서 뺐고, 대신
  `showConfirmDialog`, `handleBulkRegisterAvailability`, `handleAnniversarySaved`,
  `handleAnniversaryDeleted`, `isDarkTheme`, `setActiveLightbox`를 추가했다(모두 기존 값을
  그대로 전달하는 것뿐, 새 로직 없음). `check:app-main-inventory`로 `CalendarApp` 7700/7700
  줄 그대로 확인.
- 검증(Playwright 헤드리스):
  - 사용자 매뉴얼: 실제로 열림 확인 (`[role="dialog"][aria-label="사용자 매뉴얼"]` 렌더 확인).
  - 관리자 진입: 클릭 시 새 탭이 `&admin=1`이 붙은 URL로 정상 오픈됨을 `context.waitForEvent
    ('page')`로 확인.
  - 공유/기념일 설정: 이 샌드박스 환경은 Firestore 접근이 막혀 있어(`docs/renewal-baseline.md`
    기록된 환경 고유 제약) `calendar`가 끝내 로드되지 않으므로 실제 모달 오픈까지는 이 세션에서
    검증 불가 — 대신 (a) `requireLoadedCalendar` 가드가 `calendar`가 null일 때 아무 것도 열지
    않고 조용히 넘어가는 것(의도된 안전한 동작)을 확인했고, (b) props 구성이 `app-main.js`의
    원래 호출부(`isShareOpen && <ShareModal calendar={activeCal} showToast={showToast}
    onClose={...} />`, `isAnniversariesOpen && <AnniversaryModal ... />`)와 한 글자도 다르지
    않게 그대로 옮겨졌음을 코드 대조로 확인했다. 프로덕션에서 실제 캘린더 데이터가 있으면
    동작할 것으로 기대하지만, 이 부분은 다음에 실데이터가 있는 환경에서 한 번 더 확인이
    필요하다.
  - 기본(플래그 없음) 경로: HTML 길이 36894바이트로 4차 슬라이스와 동일, 콘솔 에러 없음.
- `npm run lint`/`check:all`/`safety:test`/`regression:test` 전부 통과.

**아직 다루지 않은 것 (의도적으로 이번 슬라이스에서 제외)**:

- **캘린더 설정** (`AdminModal`, `initialTab: 'settings'`): 원래 호출부가 `recentMessages`,
  `chatMessages`, `onDeleteMessage`, `onOpenChatMessage`(채팅 메시지로 스크롤+포커스),
  `onOpenImage`(라이트박스 오픈, 메시지 조회) 등 20개 이상의 채팅/갤러리 내부 상태·콜백에
  깊이 얽혀 있다. 이걸 `ui-app-shell-v2.js` 쪽에서 다시 만들면 "props를 그대로 전달"이 아니라
  채팅 메시지 열기 같은 실제 동작 로직을 중복 구현하게 되는데, 이는 `CLAUDE.md`가 U10~U14에서
  경계하는 "사용자가 매일 쓰는 채팅/사진 관련 핵심 동작"과 정확히 같은 위험 성격이라고 판단해
  이번 슬라이스에서 뺐다. `AdminModal` 자체는 U10~U14 명단에 있는 훅은 아니지만, 신중하게 별도
  슬라이스로 다루는 게 맞다고 본다.
- **검색** (`GlobalSearchModal`): 마찬가지로 `onOpenChatMessage`/`onOpenImage`를 필요로 해서
  같은 이유로 보류. 또한 마스터플랜 자체가 통합검색을 "신규 설계 과제"로 분류하고 있다
  (`docs/design-renewal-handoff.md` §4.5).
- **앱 설정** (`AppSettingsModal`): 브라우저 알림 권한 상태(`mainNotifPermission`,
  `mainChatNotifyEnabled`)를 여러 state setter와 Firestore 구독 설정에 걸쳐 갱신하는 로직이
  `onToggleMasterNotify`/`onToggleNotifyChannel`에 박혀 있다. 이것도 순수 데이터 전달이 아니라
  알림 권한이라는, 잘못 다루면 사용자에게 실제로 영향이 가는 로직을 복제하는 셈이라 보류했다.
  테마 토글/글자 크기 같은 나머지 하위 기능은 단순하지만, 모달 하나를 절반만 실제로 동작하게
  만드는 건 오히려 혼란스러울 수 있어 전체를 다음 슬라이스로 미뤘다.

## 2026-09-13: WP-02 착수 — 렌더얼 셸 범위의 EmptyState 공통화

`docs/product-renewal-master-plan.md` §9 WP-02("공통 상태 컴포넌트 공통화")는 원래 앱 전체를
대상으로 하는 별도 담당(디자인 시스템 에이전트) 워크스트림이지만, 지금 존재하는 "신규 화면"이
렌더얼 셸뿐이라 그 범위 안에서 먼저 시작했다.

- `EmptyState({ icon, title, subtitle })` 컴포넌트를 `ui-app-shell-v2.js`에 추가하고,
  `PlaceholderPane`(플랫 4탭용)과 `RecordsPane`의 서브탭별 플레이스홀더가 각자 반복하던
  3줄짜리 마크업을 이걸로 교체했다. `withCalendarPrefix(calendarName, text)` 헬퍼도 함께
  추출해서 "`<캘린더명> · <설명>`" 문구 조합 로직 중복도 없앴다.
- 순수 리팩터(동작 변화 없음) — `renewal-shell-placeholder*` CSS 클래스 이름/구조는 그대로라
  `app.css`는 건드리지 않았다.
- 검증(Playwright 헤드리스): `?tab=chat`(플랫 플레이스홀더)과 `?tab=records&sub=memo`(서브탭
  플레이스홀더) 양쪽 다 제목 텍스트가 리팩터 전과 동일하게 렌더됨을 확인.
- `npm run lint`/`check:all`/`safety:test`/`regression:test` 전부 통과, `app-main.js` 미변경.

**다음 WP-02 후보**: 타이포그래피 5단계/spacing/divider/elevation 토큰화, `LoadingState`/
`ErrorState`/`OfflineState`/`SectionHeader`/`CountBadge` 공통화 — 이건 앱 전체(레거시 화면
포함) 범위라 별도로 더 크게 계획해야 한다. 참고로 색상 토큰(`--brand`, `--text-main` 등)은
이미 앱 전역에 있고 렌더얼 셸도 처음부터 그걸 재사용해 왔다.
