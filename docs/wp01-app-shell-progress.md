# WP-01 진행 기록 — 기능 플래그 앱 셸

`docs/product-renewal-master-plan.md` §9 WP-01의 진행 로그. WP-01 자체의 작업 지시는 마스터플랜에
있으며, 이 문서는 "무엇을 언제 했고 왜 그렇게 했는지"만 기록한다.

**더 넓은 맥락(시안 갈래, 기능 인벤토리, 다음 작업자 체크리스트)은 `docs/design-renewal-handoff.md`를
먼저 읽을 것** — 이 문서는 그 안의 섹션 4를 더 상세히 푼 것이다.

## 2026-09-13: WP-01 완료 판정

마스터플랜 §9 WP-01의 완료 기준 3개를 아래 5개 슬라이스(PR #606~#610, 전부 병합됨)가 전부
충족한다:

1. **모든 탭에 direct URL로 진입 가능** — `?tab=calendar|chat|records|settlement|more`,
   `?sub=`(기록 탭) 전부 direct URL 진입 확인됨 (2·3차 슬라이스).
2. **새로고침과 뒤로가기가 화면 상태를 잃지 않음** — `readTabFromLocation`/
   `readRecordsSubTabFromLocation` + `popstate` 리스너로 확인됨 (2·3차 슬라이스).
3. **기존 공유 URL 검사 통과** — `npm run check:all`의 `check:share-urls`가 5개 슬라이스 전부에서
   계속 통과함.

"작업" 목록의 "기존 상단 4개 기능 탭을 기능 플래그 뒤에서 새 내비게이션으로 대체한다"는 문자
그대로의 코드 삭제는 하지 않았다 — `?shell=v2`가 켜지면 `renderRenewalShellIfEnabled`가
`CalendarApp`의 최종 `return`보다 먼저 반환해서 기존 4탭 코드는 어차피 전혀 실행되지 않는다
(기능적으로는 이미 "대체"된 상태). 실제 코드 삭제는 의도적으로 보류했다: 지금은 `?shell=v2`가
옵트인 플래그일 뿐이라 기존 코드가 죽어 있어도 위험이 없고, 동결된(`docs/app-main-split-units.md`)
`CalendarApp`에서 대량 삭제하는 건 이 플래그가 기본값으로 바뀌는 시점에 훨씬 더 큰 회귀테스트와
함께 하는 게 안전하다고 판단했다 — 그 삭제 자체가 별도의, 더 신중한 작업이다.

**다음 작업 후보** (우선순위는 사용자 지시로 결정):
- **더보기 나머지 3개**(검색/앱 설정/캘린더 설정) 연결 — 각각 채팅 내부 로직/알림 권한처럼
  신중하게 다뤄야 할 의존성이 있음 (5차 슬라이스의 "아직 다루지 않은 것" 참고).
- **WP-02 디자인 토큰/공통 상태 컴포넌트** — 마스터플랜상 별도 담당(디자인 시스템 에이전트)의
  앱 전체 작업. 참고로 렌더링 시 확인한 바, 색상 토큰(`--brand`, `--text-main` 등)은 이미 앱
  전역에 존재하고 이번 렌더 셸도 전부 그 토큰을 재사용 중이라, WP-02의 색상 분리 항목은 상당
  부분 이미 되어 있다. 남은 건 타이포그래피 5단계/spacing/divider/elevation 토큰화와
  LoadingState/EmptyState/ErrorState/OfflineState/SectionHeader/CountBadge 공통 컴포넌트화 —
  이건 앱 전체 리팩터라 범위가 크다.
- **WP-03 캘린더 홈 재구성** — 마스터플랜 순서상 다음 단계지만 `CalendarApp` 내부의 실제
  캘린더 렌더 로직과 깊이 얽혀 있어, U10~U14와 유사한 성격의 신중함이 필요할 수 있음.
- **기존 상단 4탭 코드 실제 삭제** — 위에서 설명한 대로, 플래그가 기본값이 되는 시점에 맞춰서
  하는 게 안전.

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
- ~~**앱 설정**~~ **6차 슬라이스에서 완료 (아래 참고)**.

## 2026-09-13: WP-01 6차 슬라이스 — "앱 설정" 실제 연결 (5/7)

**커밋 범위:** 5차 슬라이스에서 "알림 권한 로직 복제 위험"을 이유로 보류했던 앱 설정
(`AppSettingsModal`)을 다시 검토해서 실제로 연결. 재검토 결과, 그 우려는 과했다는 걸 확인했다 —
`onToggleMasterNotify`/`onToggleNotifyChannel`가 실제로 호출하는 함수들
(`isNotificationSupported`, `isChatNotifyEnabledForCalendar`, `setChatNotifyEnabledForCalendar`,
`getNotificationPermissionHelpSteps`, `setNotifGuideSeen`, `setNotifyChannel`,
`syncPushSubscriptionChannels`)은 전부 `src/core/app-domain-helpers.js`가 export하는 순수
유틸리티 함수라서, `app-main.js`가 하듯이 `ui-app-shell-v2.js`에서도 **같은 모듈에서 직접
import**해서 쓰면 된다 — 로직을 복제하는 게 아니라 완전히 동일한 함수를 그대로 재사용하는
것이다. `handleMainToggleNotifications`(브라우저 알림 권한 요청, 푸시 구독 재시도 등 훨씬 더
복잡한 로직)는 `useNotificationPwaState` 훅이 이미 완성해 둔 함수라 이것도 그대로 참조만 하면
된다. 반면 5차 슬라이스에서 뺀 캘린더 설정/검색은 `onOpenChatMessage`가 `changeView('chat')`로
`activeView` state를 바꾸는데, 그 state가 구동하는 JSX는 `?shell=v2`의 조기 반환 아래에 있어
여전히 무동작이다 — 이건 진짜 다른 문제(전환 대상 화면 자체가 없음)라 계속 보류.

- `ui-app-shell-v2.js`가 `src/core/app-domain-helpers.js`에서
  `isNotificationSupported`/`isChatNotifyEnabledForCalendar`/`setChatNotifyEnabledForCalendar`/
  `getNotificationPermissionHelpSteps`/`setNotifGuideSeen`/`setNotifyChannel`/
  `syncPushSubscriptionChannels`를 직접 import — `app-main.js`가 쓰는 것과 동일한 소스.
- `REAL_MORE_MODAL_IDS`에 `'app-settings'` 추가, `MoreModalsHost`가 `AppSettingsModal`도 렌더.
- `buildRenewalMoreContext`의 `modalProps['app-settings']`는 `app-main.js`의
  `isAppSettingsOpen && <AppSettingsModal ...>` 호출부와 완전히 동일한 프롭 구성(테마/글자
  크기/알림권한/알림채널/날씨위치/토스트/도움말단계/캘린더/확인다이얼로그/데이터새로고침).
- `app-main.js`의 어댑터 호출 한 줄에 deps 추가: `toggleTheme`, `fontScalePercent`,
  `setFontScalePercent`, `mainNotifPermission`, `setMainNotifPermission`,
  `mainChatNotifyEnabled`, `setMainChatNotifyEnabled`, `notifyChannels`,
  `setNotifyChannelsState`, `handleMainToggleNotifications`, `handleUpdateWeatherLocation`,
  `handleDeleteRecentWeatherLocation`, `getCurrentChatParticipantId`, `setCloudReloadToken` —
  전부 이미 있던 값을 그대로 전달, 새 로직 없음. `check:app-main-inventory`로 `CalendarApp`
  7700/7700 그대로 확인.
- 검증(Playwright 헤드리스): `?shell=v2&tab=more`에서 "앱 설정" 클릭 → 실제 `AppSettingsModal`
  오픈 확인(`[role="dialog"]`/`.modal-overlay` 렌더, 테마/글자 크기 컨트롤 텍스트 존재 확인).
  기본(플래그 없음) 경로 HTML 길이 36894바이트로 동일, 콘솔 에러 없음.
- `npm run lint`/`check:all`/`safety:test`/`regression:test` 전부 통과.

**아직 다루지 않은 것**: 캘린더 설정(`AdminModal`)과 검색(`GlobalSearchModal`)만 남았다 — 둘 다
`changeView('chat')`으로 채팅 메시지 위치로 이동시키는 콜백(`onOpenChatMessage`/`onOpenImage`)이
필요한데, 대화 탭 자체가 아직 플레이스홀더라 이동할 실제 화면이 없다. WP-05(채팅 독립 화면)가
실제 데이터로 채워진 뒤에나 자연스럽게 풀리는 문제라 그 전까지는 보류.

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

## 2026-09-13: WP-03 착수 — 캘린더 탭 실제 연결 (달력 그리드 + 날짜 모달)

**배경:** 사용자가 "메인화면부터 채워줘" — `?shell=v2`의 캘린더 탭이 지금까지 완전히 빈
플레이스홀더였던 것을 실제 콘텐츠로 채우는 작업. `CalendarGrid`/`DateModal`은 (더보기 탭의
`AdminModal`/`GlobalSearchModal`과 달리) `onOpenChatMessage`/`onOpenImage` 같은 대화 탭 전환
콜백에 의존하지 않는 자기완결적 컴포넌트라, 5차 슬라이스에서 보류했던 것들과 달리 이번 슬라이스
에서 바로 실제로 연결할 수 있었다.

**핵심 발견 (activeCal null vs. 항상-객체 버그):** `app-main.js`의 `activeCal`은
`React.useMemo(() => ({...rawActiveCal, places: ..., confirmedMeeting: ...}))`로 만들어져서,
`rawActiveCal`이 아직 로드되지 않아 `null`이어도 `{...null}`은 자바스크립트에서 `{}`이 되므로
`activeCal`은 **항상 최소 `{places, confirmedMeeting}` 형태의 객체**다 — 절대 `null`이 아니다.
반면 이 셸이 여기저기 돌려쓰는 공유 `calendar` prop(`activeCalLoaded ? activeCal : null`)은
더보기 탭의 "아직 로드 안 됨" 토스트(`requireLoadedCalendar`)를 위해 **의도적으로 null이 될 수
있게** 설계되어 있다. `CalendarGrid`/`DateModal`은 원본 그대로 가져다 쓰는 컴포넌트라
`calendar.availabilities` 등을 null 가드 없이 바로 읽는데, 이건 원본 `app-main.js` 호출부가
항상 진짜 `activeCal`(null 아님)을 넘기기 때문에 원래는 문제가 안 됐던 코드다. 이 공유
nullable `calendar`를 그대로 넘겼다가 Playwright 헤드리스 테스트에서 실제 런타임 크래시로
잡혔다: `TypeError: Cannot read properties of null (reading 'availabilities')` at
`ui-calendar-core.js`, `AppErrorBoundary`로 떨어짐.

**해결책:** `calendarContextDeps`에 CalendarApp의 `activeCal`(항상 객체)을 새 의존성으로 추가해서,
`buildRenewalCalendarContext`가 자신의 nullable `calendar` 파라미터 대신 이 `activeCal`을
`calendar: activeCal`(그리드용)과 `dateModalProps.calendar: activeCal`(날짜 모달용)로 반환하도록
수정. 로직 재구현이 아니라 "어느 값을 넘기느냐"만 고친 것.

- `buildRenewalCalendarContext(calendar, deps)` 신설 — `deps`로 `activeCal`,
  `anniversariesWithPosters`, `isInitialDataLoading`, `handleMoveAvailability`,
  `displayChatMessages`, `memos`, `customCultureItems`, 참석/삭제/정산/사진/장소 관련 20여개
  핸들러, `showToast`, `showConfirmDialog`, `syncStatus`, `photoCommentCounts`,
  `setActiveLightbox` 등 — 전부 이미 있던 `app-main.js`의 값/함수를 그대로 전달, 새 로직 없음.
  `calendar` 파라미터 자체는 쓰지 않는다(시그니처 대칭용으로만 유지).
- `CalendarPane` 컴포넌트 신설 — 자신의 로컬 `monthDate`/`dateModalDate` state로 월 이동과
  날짜 모달 열기/닫기를 직접 관리(`CalendarApp`의 `currentMonthDate`/`isModalOpen` state는
  `?shell=v2` 조기 반환 아래라 무동작이므로, 이전 슬라이스들과 같은 패턴으로 셸이 자체 state
  소유). `bindUiComponentAliases`로 실제 `CalendarGrid`/`DateModal`을 렌더.
- 날짜 모달의 "기념일 편집"/"+ 기념일 등록" 버튼은 더보기 탭과 동일한 `AnniversaryModal`을
  편집 id 또는 시작 날짜로 미리 채워 연다(기존 `MainSideMenu` 플로우와 동일). "컨텐츠 원본"
  포커스는 아직 실제 컨텐츠 화면(WP-06 몫)이 없어 기록 탭의 콘텐츠 서브탭으로만 이동시킨다.
- `renderRenewalShellIfEnabled`가 4번째 인자 `calendarContextDeps`를 받도록 확장,
  `app-main.js`의 어댑터 호출 한 줄에 `activeCal`을 포함한 새 객체 리터럴 추가 —
  `check:app-main-inventory`로 `CalendarApp` 7700/7700 그대로 확인.
- 검증(Playwright 헤드리스): `?shell=v2&tab=calendar`에서 실제 달력 그리드가 렌더됨(2026년 9월,
  공휴일 라벨 "백로"/"추분"/"추석 연휴"/"개천절" 등 실데이터 확인, 이전의 null 크래시 없음).
  날짜(15일) 클릭 → 실제 `DateModal` 오픈 확인(참석/장소/정산/사진 탭, 참여자 선택 UI 등 실제
  내용 렌더, 콘솔 에러 없음). 기본(플래그 없음) 경로 HTML 길이 36894바이트로 이전과 동일, 콘솔
  에러 없음(네트워크가 차단된 샌드박스 환경에서 나오는 `ERR_CONNECTION_RESET` 제외).
- `npm run lint`/`check:app-main-inventory`/`check:all`/`safety:test`/`regression:test`(빌드
  포함) 전부 통과.

**아직 다루지 않은 것**: 마스터플랜의 캘린더 탭 설명에 있는 "가까운 일정/응답 필요/최근 소식"
같은 홈 요약 섹션은 이번 슬라이스 범위 밖 — 사용자의 "메인화면부터 채워줘" 요청은 우선 달력
그리드+날짜 모달 자체를 실동작시키는 것으로 해석했다. 요약 섹션 추가는 다음 확인 후 별도
슬라이스로 진행할지 결정.

## 2026-09-13: WP-03 2차 슬라이스 — 홈 요약 "가까운 일정"/"응답 필요"

**배경:** 1차 슬라이스에서 보류했던 홈 요약 섹션을 사용자에게 우선순위 확인 후 진행. 마스터플랜
§4.2가 지정한 캘린더 홈 표시 순서(헤더 → 월간 캘린더 → 가까운 일정 → 내가 응답할 일 → 최근
소식) 중 앞의 두 개(가까운 일정/응답 필요)는 기존 앱에 이미 정확히 대응하는 데이터/로직이
있어서 이번 슬라이스에서 실제로 연결했다. 세 번째(최근 소식)는 대응하는 데이터 모델이 없어
보류했다(아래 참고).

- **가까운 일정**: `app-main.js`의 메인 화면이 이미 호출하고 있는 순수 셀렉터
  `buildMainCalendarScreenState`(`src/core/app-calendar-screen-state.js`)를
  `ui-app-shell-v2.js`에서 그대로 다시 호출해서 `visibleConfirmedMeetings`(오늘 이후 확정
  일정, 날짜 오름차순)를 얻는다 — "어떤 확정 일정이 다가오는 일정인가"라는 판단 로직을 새로
  만들지 않고 기존 로직을 그대로 재사용. 최대 3개(마스터플랜 §4.2: "가까운 일정 1~3개")를
  `UpcomingMeetingsSection`으로 렌더링, 날짜/D-day(`formatDDayLabel`)/라벨
  (`formatConfirmedMeetingLabel`)/메모 스니펫을 표시. `confirmedMeeting` 레코드에는 별도의
  "제목"/"장소" 필드가 없어(날짜/메모/확정시각/사진/정산만 있음) 마스터플랜 §5.3이 말하는
  "제목, 장소"는 데이터에 없는 걸 지어내지 않고 생략했다 — 있는 필드(날짜, D-day, 메모)만
  그대로 보여준다. 클릭하면 `CalendarPane`이 이미 갖고 있는 `setDateModalDate`로 해당 날짜의
  실제 `DateModal`을 연다(새 네비게이션 로직 없음, 날짜 셀 클릭과 동일한 경로).
- **응답 필요**: 마스터플랜 §5.3 "활성 투표가 없으면 큰 빈 카드를 표시하지 않는다"에 맞춰
  `buildMainCalendarScreenState`의 `hasVisiblePolls`가 false면 섹션 자체를 렌더링하지 않는다.
  true면 `app-main.js`의 메인 화면이 실제로 렌더링하는 것과 동일한 컴포넌트 3종
  (`PollList`/`PollModal`/`PollVoterSheet`, 전부 이미 `app-ui-wrappers.js`의
  `VIEW_WRAPPER_COMPONENT_NAMES`에 등록되어 있어 `bindUiComponentAliases`로 바로 사용 가능)과
  핸들러 6개(`handleOpenPollCreate`/`handleOpenPollEdit`/`handleSavePoll`/
  `handleOpenVoteSheet`/`handleVotePoll`/`handleCancelVote`, 전부 기존 `CalendarApp` 로직
  그대로)를 그대로 pass-through — 투표 생성/수정/투표하기/취소를 전부 실제로 할 수 있다.
  투표 시스템에는 앱 안에 별도의 전용 화면이 없어서(기존에도 메인 화면에 직접 박혀 있었다),
  이 홈 요약 섹션이 곧 그 기능의 유일한 진입점이자 실사용 화면이다.
  - `isPollModalOpen`/`editingPoll`/`voteTarget`은 `CalendarApp`의 기존 `useState`라
    `?shell=v2` 조기 반환 아래에서는 무동작이었던 것과 같은 이유로, 이 셋과 그 setter를
    `calendarContextDeps`에 새로 추가해서 셸이 직접 읽고 닫을 수 있게 했다(1차 슬라이스의
    `activeCal` 처리와 같은 패턴).
- **최근 소식(보류)**: 앱에 "최근 소식" 피드에 대응하는 기존 데이터 모델이 없다.
  `pinnedNotices`는 이름은 비슷하지만 실제로는 채팅방 공지사항 기능(`ui-chat-room.js`)이라
  전혀 다른 개념이고, `activityLogs`는 관리자 복구용 전체 감사 로그라 사용자 대상 "소식"으로
  보여주기엔 맥락이 다르다(예: 마감 시각 변경, 되돌리기 등 내부적인 항목도 섞여 있음). 무엇을
  "소식"으로 칠지 새로 정의하는 건 검증되지 않은 로직을 만드는 것이라 이번 슬라이스에서는
  스킵 — 마스터플랜 §5.3의 "완료·마감된 항목은 최근 소식 또는 기록 화면으로 이동한다"는
  규칙도 기록 화면(WP-06)이 먼저 실재해야 의미가 있어 함께 보류.
- 검증(Playwright 헤드리스): `?shell=v2&tab=calendar`에서 확정 일정이 있는 캘린더로 진입 시
  "가까운 일정" 카드가 D-day와 함께 렌더되고 클릭하면 해당 날짜의 실제 `DateModal`이 열림을
  확인. 투표가 있는 캘린더에서는 "응답 필요" 섹션에 실제 `PollList`가 렌더되고 투표 생성/투표
  하기 흐름이 동작함을 확인(둘 다 없는 캘린더에서는 두 섹션 모두 렌더되지 않아 빈 큰 카드가
  없음을 확인). 기본(플래그 없음) 경로는 HTML 길이·콘솔 에러 이전과 동일.
- `npm run lint`/`check:app-main-inventory`/`check:all`/`safety:test`/`regression:test`(빌드
  포함) 전부 통과.

**아직 다루지 않은 것**: 최근 소식(위에서 설명한 대로 보류), 마스터플랜 §5.3의 "미정 참석/미처리
정산"까지 포함하는 완전한 "내가 응답할 일" 통합 뷰(지금은 활성 투표만) — 이건 날짜 허브(WP-04)의
selector 계층이 먼저 정의되어야 "미정 참석"이 무엇을 뜻하는지 일관되게 판단할 수 있어서, WP-04
이후로 미룬다.

## 2026-09-13: WP-05 착수 — "대화" 탭 실제 연결

**배경:** 사용자가 다음 우선순위로 "대화 탭 연결"을 선택. 마스터플랜 §5.4(채팅)는 홈 미리보기,
최초 진입 메시지 수 제한, 새 메시지 구독/과거 메시지 pagination 분리, YouTube/Vimeo 썸네일화
등 광범위한 요구사항을 담고 있지만, 이 중 사실상 전부가 이미 기존 `ChatRoomView` 컴포넌트
(`src/ui/ui-chat-room.js`, `app-main.js`의 `activeView === 'chat'`가 그대로 렌더하던 것)에
구현되어 있다 — WP-03의 `CalendarGrid`/`DateModal`과 같은 성격이라, 로직을 다시 만들지 않고
그대로 pass-through 하는 게 맞다고 판단했다.

**5차 슬라이스에서 보류했던 이유가 여기서는 적용되지 않는 이유**: `ChatRoomView` 자체는 (더보기
탭의 `AdminModal`/`GlobalSearchModal`과 달리) `onOpenChatMessage`/`onOpenImage` 같은 "대화 탭으로
전환" 콜백이 **필요 없다** — 이미 대화 탭 그 자체이기 때문이다. 유일한 탐색 의존성은
`onBack`/`onOpenGallery`/`onChangeView`(레거시 최상단 뷰 전환)인데, 이것들은 전부 이 셸의
탭/서브탭 전환으로 그대로 매핑 가능하다.

- **지연 로드 처리**: `ChatRoomView`는 `CalendarGrid`/`DateModal`과 달리 메인 번들에 없고
  `window.__gatherLoadChatUi()`로 온디맨드 로드되는 별도 청크다(`app-main.js`의 `changeView`가
  쓰는 것과 동일한 트리거). `ChatPane`이 마운트 시 이 로드를 기다렸다가 렌더하는 "wait-then-open"
  단계를 추가했다 — 더보기 탭의 공유/매뉴얼/기념일이 이미 쓰던 패턴과 동일.
- **`buildRenewalChatContext(calendar, deps)` 신설**: 컴포저 상태(`chatInput`/`chatImages`/
  `chatFileAttachments`/`chatReplyTarget` 등), 메시지 전송/삭제/수정, 공지 등록/삭제, 스크롤/헤더
  표시, 이미지 태그/검색, 점프(채팅 메시지/메모/모임 날짜), sticky-video 활성화 등 `app-main.js`의
  `activeView === 'chat'` 호출부가 쓰던 ~35개 값/함수를 전부 그대로 pass-through. 새 로직 없음.
- **`onChangeView` 매핑**: `ChatSideMenu`(대화 탭 내부 햄버거 메뉴)가 호출하는 레거시
  `changeView(view)`를 재구현하는 대신, `RenewalAppShell`에 뷰 id → 탭/서브탭 매핑 함수 하나를
  추가했다(`memo`→기록/메모, `places`→기록/장소, `gallery`→기록/사진·영상, `history`→기록/보관함,
  `content`→기록/콘텐츠, `settlement`→정산 탭, 그 외→캘린더 탭). `onBack`/`onOpenGallery`도 이
  같은 함수로 구성 — 새로운 네비게이션 로직이 아니라 이미 5차 슬라이스에서 쓰던 탭 전환 함수를
  재사용하는 것.
- **더보기 모달 재사용**: 대화 탭의 "앱 설정" 진입도 더보기 탭과 완전히 같은 `AppSettingsModal`을
  열도록, 기존 `handleSelectMoreItem`의 트리거 로직을 `openMoreModalById(id)`로 뽑아내서
  `onOpenAppSettings`가 그대로 재사용하게 했다(순수 리팩터, 더보기 탭 동작 변화 없음).
- **의도적으로 보류한 것**: 탭을 벗어나도 영상이 떠 있는 채로 계속 재생되는 "sticky video"
  전역 기능(`withStickyVideo`)은 이 셸을 감싸지 않았다 — `stickyVideoKey`/`onActivateVideo`
  자체는 실제 값 그대로 전달해서 대화 탭 안에서 영상 재생 자체는 정상 동작하지만, 탭을 벗어났을
  때 떠 있는 미니 플레이어로 이어지진 않는다. 이건 "일단 동작하는 대화 탭" 위에 얹는 향상
  기능이라 이번 슬라이스 필수 범위가 아니라고 판단했다.
- `app-main.js`의 어댑터 호출이 5번째 인자(`chatContextDeps`)를 받도록 확장 —
  `check:app-main-inventory`로 `CalendarApp` 7700/7700 그대로 확인.
- 검증(Playwright 헤드리스): `?shell=v2&tab=chat` 진입 시 실제 `ChatRoomView`가 렌더됨(헤더,
  "아직 등록된 대화가 없습니다." 빈 상태, 참여자 선택/전송 버튼이 있는 컴포저, 콘솔 에러 없음).
  헤더의 메뉴 버튼 클릭 → 크래시 없음. 캘린더 탭으로 돌아가기(하단 내비 클릭) → 실제 달력 그리드
  정상 렌더(회귀 없음). 기본(플래그 없음) 경로 HTML 길이 36894바이트로 동일, 콘솔 에러 없음.
- `npm run lint`/`check:app-main-inventory`/`check:all`/`safety:test`/`regression:test`(빌드
  포함) 전부 통과.

**아직 다루지 않은 것**: sticky-video 전역 플로팅(위에서 설명), 홈(캘린더 탭)의 "최근 메시지
1~3개 미리보기"(마스터플랜 §5.4) — 대화 탭 자체가 이제 실동작하니 다음 확인 후 진행할 수 있는
후보. 최초 메시지 로드 개수 조절/과거 메시지 pagination 분리(§5.4의 세부 성능 요구사항)는
`ChatRoomView`/`loadOlderChatMessages`가 이미 구현한 그대로를 재사용했을 뿐, 이 슬라이스에서 그
내부 로직을 손대거나 검증하지 않았다.

## 2026-09-13: WP-06 — "기록" 탭 "사진·영상" 서브탭 실제 연결 (+ 셸 공용 버그 이식)

**배경:** 기록 탭의 "사진·영상" 서브탭(옛 `activeView === 'gallery'`, 실제 컴포넌트는 `asPage:
true`로 렌더되는 `ChatGalleryModal`)을 실제 연결. WP-05/WP-06(메모·장소·보관함)과 동일한
pass-through 패턴: `app-main.js`의 `activeView === 'gallery'` 호출부가 쓰던 프롭 전부를
`buildRenewalRecordsContext`의 새 `mediaProps`로 그대로 전달. `ChatGalleryModal`은 `ChatRoomView`와
같은 지연 로드 청크(`window.__gatherLoadChatUi`)에 있어, `ChatPane`이 이미 쓰던 "청크 로드 대기 →
렌더" 패턴을 `MediaPane`에도 그대로 재사용했다.

- `onChangeView`가 이미 WP-05에서 `gallery` → 기록/사진·영상으로 매핑해 둔 상태라(`ChatRoomView`
  내부의 "갤러리로 이동" 진입점을 위해 미리 준비됨), 이 슬라이스는 그 매핑의 목적지를 실제로
  채우기만 하면 됐다 — 새로운 네비게이션 로직 없음.
- `app-main.js`의 어댑터 호출이 6번째 인자(`recordsContextDeps`)를 받도록 확장 —
  `check:app-main-inventory`로 `CalendarApp` 7700/7700 그대로 확인.
- **`bindUiComponentAliases` 캐시 수정을 이 브랜치에도 이식**: 이 슬라이스는 병합된 `main`
  기준으로 새로 브랜치했는데(당시 PR #621의 "보관함" 슬라이스가 아직 병합되지 않은 상태), #621에서
  발견/수정한 셸 전역 버그(`bindUiComponentAliases`가 호출마다 새 함수 객체를 반환해서, 렌더
  본문에서 호출하는 모든 Pane이 컴포넌트를 매 렌더마다 리마운트시키는 문제 — `src/core/
  app-ui-wrappers.js`에 `WeakMap` 캐시 추가로 수정)가 아직 이 브랜치의 베이스에는 없었으므로,
  동일한 수정을 이 브랜치에도 그대로 옮겨왔다(같은 패치를 #617/#618/#619/#620에도 이식 완료 —
  전부 같은 근본 원인을 공유하는 알려진 버그였음). `main`에 병합될 때 중복 diff로 충돌하겠지만,
  git이 동일 패치를 인식하고 자동 정리되거나 트리비얼하게 해소될 것으로 예상.
- 검증(Playwright 헤드리스): `?shell=v2&tab=records&sub=media`가 실제 `ChatGalleryModal`을
  렌더(헤더, 사진/링크/파일 탭, "사진 목록을 불러오는 중…" 빈 상태) — 플래그 없는 `?view=gallery`
  컨트롤 경로와 동일한 HTML 패턴, `ERR_INSUFFICIENT_RESOURCES` 0건(컨트롤도 0건, PR #621에서
  고친 리마운트 버그가 여기서도 재발하지 않음을 함께 확인). 회귀 확인으로 `tab=calendar`도 정상
  렌더.
- `npm run lint`/`check:app-main-inventory`(7700/7700)/`check:all`/`safety:test`/`regression:test`
  (빌드 포함) 전부 통과.

**아직 다루지 않은 것**: `ChatGalleryModal` 내부의 사진 인덱스/페이지네이션/파일 업로드 등은
기존 구현을 그대로 재사용했을 뿐 이 슬라이스에서 손대지 않음. 기록 탭의 "전체" 서브탭(사진·영상/
메모/장소/보관함을 한데 모아 보여주는 통합 뷰)은 원본 앱에 직접 대응하는 화면이 없어 별도 설계가
필요 — 아직 착수 안 함.
