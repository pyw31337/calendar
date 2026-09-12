# CLAUDE.md — orientation for any agent picking up this repo cold

이 파일은 컨텍스트 없는 에이전트(Claude든 다른 모델이든)가 이 저장소에 처음 들어왔을 때
사고 없이 안전하게 작업을 이어가도록 하기 위한 진입점이다. 세부 내용은 각 문서를 따라가되,
아래 "건드리면 안 되는 것"만큼은 반드시 지킨다.

## 이 프로젝트는 무엇인가

"모여라 달력" — 소모임 일정 조율 + 채팅 + 갤러리 + 정산 + 관리자 대시보드가 있는 React 웹앱.
Firebase(Firestore/Storage/Functions)가 유일한 데이터 소스다. Vite로 빌드해서 GitHub Pages에
배포한다 (`src/` → `dist/`). 여러 개의 독립된 캘린더(kkot/cw/jhair 등)를 한 코드베이스가
서빙하며, 캘린더 간 데이터가 절대 섞이면 안 된다 (아래 "캘린더 격리" 참고).

`index.html`/`assets/*`는 예전 vanilla-script 배포판의 롤백/참고용 사본이다. **라이브 소스는
`src/`뿐이다.** `assets/*`를 실제 배포 변경으로 착각해서 고치지 말 것 — 다만 일부 검사
스크립트(`check-asset-mirrors.mjs` 등)가 `assets/`와 `public/assets/`의 바이트 동일성만
확인하니, 그 둘을 건드릴 일이 생기면 서로 동기화해야 한다.

## 지금 상태 (2026-09-12 기준)

`src/core/app-main.js`를 여러 개의 작은 `src/core/app-*.js` 모듈로 나누는 대규모 리팩터가
진행 중이었고, **U0~U9(전부) 는 완료됐다** (`docs/app-main-split-units.md` 참고 — 다만 이 문서
하단의 "진행 표"는 실제 반영이 안 된 채 남아있던 낡은 표였다; 지금 최신화했다). 결과:

- `app-main.js`는 12,065줄 → 8,838줄로 줄었고, 최상위 REAL(비-CalendarApp) 선언이 30개 →
  15개로 줄었다.
- 남은 최상위 REAL 선언은 대부분 부트스트랩 상수/전역(`GATHER_APP_CONSTANTS`,
  `GATHER_APP_UTILS`, `React`/`ReactDOM`, `__gatherStartApp`)이거나, `CalendarApp` 내부와
  강하게 얽혀서 더 쪼갤 수 없다고 판단된 것들이다 (`extractDirectImageUrls`,
  `getAllDirectMediaImageEntries` 등 — 각 자리에 왜 남았는지 주석으로 설명해뒀다).

**아직 손대지 않은 두 가지가 있고, 둘 다 의도적으로 보류 중이다:**

1. **U8 — `bindGatherUiDeps` 카탈로그화.** `app-main.js` 안의 ~300줄짜리 함수 하나가 파일
   전체에 흩어진 수백 개의 로컬 이름을 `typeof X === 'function' ? X : null` 패턴으로 참조해서
   객체를 만든다. 이건 몇 개의 외부 함수만 호출하는 게 아니라 파일 자체의 로컬 스코프에
   의존하는 구조라, 다른 U9류 유닛처럼 "그냥 옮기기"가 안 된다. 각 이름을 하나하나 검증하지
   않고는 안전하게 분리할 수 없다고 판단해서 보류했다.
2. **U10~U14 — `CalendarApp` 내부 훅 5개 분리** (`useChatMessageWindow`,
   `useMemoCollections`, `useGalleryIndexBindings`, `createCalendarPhotoActions`, 뷰 JSX 본체).
   이건 채팅 구독/hydration, 갤러리 페이지네이션, 사진 태그/삭제처럼 사용자가 매일 쓰는 핵심
   동작을 직접 건드리는 영역이다. **자동 테스트만으로는 실사용성을 완전히 보장할 수 없어서,
   훅 하나마다 사용자의 명시적 승인 없이는 절대 시작하지 않는다.** "남은 거 다 진행해",
   "알아서 판단해" 같은 포괄적 지시가 와도 이 원칙은 넘어서지 않는다 — 반드시 "U10
   시작해"처럼 유닛을 콕 집은 지시가 있어야 한다.

이 두 가지를 빼면, 이 리팩터 계획 범위 안에서는 더 옮길 게 없다. **다만 이건 "이 계획이
다뤘던 것"에 한정된 얘기고, 저장소 전체에 대한 포괄적 코드 감사는 아니다** — 이 계획 밖의
다른 개선 여지(예: 다른 파일의 구조, 테스트 커버리지, 성능)는 별도로 확인한 적 없다.

## 절대 하면 안 되는 것 (여러 문서에 흩어진 규칙을 모음)

- **캘린더 격리**: 모든 Firestore 문서/쿼리는 `cal_${calendarId}` 스코프를 통과해야 한다.
  `kkot`/`cw`/`jhair` 같은 캘린더 ID를 코드에 하드코딩하지 않는다 (테스트 픽스처/smoke URL
  목록 제외). `scripts/check-calendar-isolation.mjs`가 이를 강제한다.
- **JSONBlob이나 새 localStorage 영속화 경로를 추가하지 않는다** —
  `scripts/check-live-source-guards.mjs`가 차단한다.
- **`assets/*`를 라이브 배포 변경으로 착각해서 고치지 않는다.**
- **Firestore/Storage 규칙을 에뮬레이터나 targeted live smoke 없이 바꾸지 않는다.**
- **데이터 모델을 백업/복구 리허설 없이 바꾸지 않는다.**
- U10~U14는 위에서 설명한 대로 사용자 승인 없이 시작하지 않는다.

## 코드를 옮기거나 고칠 때 지키는 검증 절차

이 저장소에는 자동 게이트가 많다. 최소한 다음을 통과해야 "된 것"이다:

```
npm run lint                # 변경 파일 대상 eslint
npm run check:all           # lint + 테스트 + 격리/보안/디자인/사이즈 등 전체 가드 스크립트
npm run safety:test         # scripts/firebase-safety-tests.mjs — 정적 소스 검사 다수
npm run regression:test     # npm run build 포함 — 실제 프로덕션 번들이 만들어지는지 확인
```

그리고 `vite preview` + 헤드리스 브라우저로 부팅 확인(루트 HTML 길이가 정상 범위인지,
`ERR_CONNECTION_RESET` 외의 에러가 없는지)까지 하는 게 이 저장소에서 굳어진 관행이다.

코드를 한 파일에서 다른 파일로 "그냥 옮기는" 리팩터(U9류)를 또 하게 된다면:
1. 옮길 함수의 모든 의존성(호출하는 함수/상수)이 어디서 오는지 먼저 확인한다 — 이미
   export되어 있으면 임포트만 추가하면 되고, 그 파일에만 로컬로 있으면 함께 옮기거나
   두 파일 다 못 옮기는 이유를 판단한다.
2. 옮긴 뒤 원래 파일에서 죽은 import가 생겼는지 확인하고 지운다.
3. `scripts/firebase-safety-tests.mjs` 안에 옮긴 심볼의 "어느 파일에 있어야 하는지"를
   하드코딩한 assert가 있는지 검색해서, 있으면 새 위치로 맞춘다.
4. 순환 import가 생겨도, 실제 참조가 모듈 최상위가 아니라 함수 호출 시점에만 일어난다면
   Vite/Rollup과 Node 양쪽에서 문제없이 동작한다 — 다만 `regression:test`(빌드)와
   `safety:test`(plain Node import)로 반드시 직접 확인하고 넘어간다.

## 더 읽을 문서

- `docs/module-map.md` — 로드 순서, 파일 귀속 규칙
- `docs/app-main-split-units.md` — 이 리팩터의 전체 유닛 카탈로그와 진행 로그
- `docs/architecture-review-20260821.md` — 더 넓은 아키텍처 리스크/개선 순서
- `docs/calendar-isolation.md`, `docs/firebase-cost-guardrails.md`,
  `docs/mobile-checklist.md` — 각 주제별 세부 규칙
