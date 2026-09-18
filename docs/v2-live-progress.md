# V2 리뉴얼 작업 현황

이 문서는 V2 화면 리뉴얼의 진행 상태와 검증 결과를 누적 기록한다.

## 2026-09-18 16:51 KST

사용자 스크린샷 5건 기반 버그 리포트 5건 처리:

1. **채팅 사이드메뉴 마지막 발신자 오표시**: `ui-app-shell-v2.js`의 `allChat` 기반 미리보기가
   `ChatRoomView`의 실제 `visibleChatMessages` 필터(`uploadSource !== 'meeting'/'gallery'` —
   모임 확정 사진은 채팅 메시지이지만 대화창엔 안 보임, docs §3.5/3.9)를 적용하지 않아, 채팅창엔
   안 보이는 모임 사진 메시지가 실제 마지막 대화보다 나중 타임스탬프면 그 업로더가 미리보기에
   뜨는 버그. 같은 필터를 추가해 수정.
2. **메모 페이지 세로 스크롤 완전 불가**: 오늘 이른 세션의 커밋(`51523097 fix(v2): reuse home
   memo card presentation on memo page`)이 `MemoScreen`을 `useDedicatedCards` 경로로 바꾸면서,
   `screens.css`가 스크롤 가능하게 만드는 대상인 `.v2-dest-body`/`.v2-memo-body` 래퍼 클래스를
   빠뜨렸다 — 나머지 flex 체인은 전부 `overflow:hidden`이라 메모 리스트가 정확히 한 화면
   높이에서 잘리고 스크롤 자체가 안 됨(스크롤바도, 휠도, 터치도 전부 무반응 — 실측:
   `scrollHeight === clientHeight`). 그 래퍼로 감싸서 해결.
3. **메모 등록(작성) 섹션 소실**: 같은 커밋으로 `useDedicatedCards` 경로가 되면서 legacyView의
   `.memo-composer-card`("새로운 메모를 남겨보세요...")를 추출해서 보여주던 로직이 완전히
   빠졌음(`slots: {}`). `extractMemoSlots(p.legacyView).composer`를 다시 뽑아 리스트 최상단에
   렌더링하도록 복구.
4. **장소 페이지 "전체/방문/예정" 필터 + 편집 버튼이 리스트와 함께 안 스크롤됨, 여백도 다름**:
   `PlacesScreen`이 `slots.toolbar`를 스크롤 컨테이너(`.v2-dest-body`) 밖, 헤더 아래 고정 위치에
   렌더링하고 있었음. 스크롤 컨테이너 안, 리스트 바로 위로 이동시켜 리스트와 함께 스크롤되도록
   수정(좌우 여백은 `.places-list-toolbar`/`.places-list-body`가 이미 같은 12px 패딩을 쓰고
   있어서 위치만 옮기면 자동으로 맞춰짐).
5. **모바일에서 헤더 더보기(≡) 버튼이 사이드메뉴를 안 엶**: `aurora-theme.css`의 오프캔버스
   드로어(열기/닫기 transform, 백드롭, 닫기 버튼)가 `@media (min-width: 768px) and (max-width:
   1200px)`(태블릿 전용)로만 걸려 있었고, `<768px`(진짜 모바일)는 별도 "Mobile: no rail" 블록이
   `.bp-side-nav { display: none }`을 무조건 적용해서 드로어 자체가 렌더링될 수 없었음 — 이번
   세션 이전부터 있던 버그로 보이며, 오늘 앞서 추가된 모바일 퀵네비(채팅/정산/메모/갤러리)가
   바로 이 문제의 우회책이었던 것으로 보임. 드로어 조건을 `@media (max-width: 1200px)`로 넓히고
   `display:none`을 제거해 모바일에도 태블릿과 동일한 동작하는 드로어를 적용.

검증: 5건 전부 Playwright 헤드리스(390×844 등)로 실제 동작 확인(가짜 데이터 주입 포함) —
드로어 열림(`nav` bounding box가 화면 안으로 들어옴), 메모 스크롤(`scrollTop` 실제 이동),
메모 작성 섹션 텍스트 렌더링, 장소 툴바가 스크롤에 딸려 화면 밖으로 이동. `npm run lint`,
`npm run check:all`, `npm run safety:test`, `npm run regression:test` 전부 통과.

## 2026-09-18 16:34 KST

- 사용자 피드백(스크린샷 2장) 반영: 모바일 히어로 카드가 여전히 둥근 모서리로 보이는 원인을
  찾음 — `border-radius`는 이미 다른 곳의 `!important` 규칙(0)이 이기고 있었지만,
  `aurora-theme.css`의 모바일 성능/컨테인먼트 가드가 독립적으로 `clip-path: inset(0 round 16px)`
  를 걸어놔서 실제 렌더링은 계속 16px 라운드로 보이고 있었다(진짜 원인은 border-radius 충돌이
  아니라 clip-path). `clip-path: inset(0)`로 수정하고, 같은 값(`border-radius:0`)을 중복
  선언하던 또 다른 죽은 규칙도 제거.
- 모바일(<768px, 사이드메뉴 없는 화면) 전용 "채팅 정산 메모 갤러리" 퀵네비 아이콘 행을 히어로
  헤더와 D-day 배지 사이에 추가(`HeroQuickNav`, `ui-app-shell-v2.js`). 사이드 레일이 있는
  ≥768px에서는 `.bp-hero-quick-nav { display: none }`로 완전히 숨김(같은 목적지를 두 번
  노출하지 않음). 정산 아이콘에는 기존 사이드메뉴와 동일한 `settlementBalanceBadge`(예: "-32만")
  뱃지를 재사용. 버튼은 기존 `.bp-icon-btn`(원형 글래스 버튼) 클래스를 그대로 재사용해 새 버튼
  모양 CSS를 추가하지 않음.
- 미디어쿼리 통폐합: 같은 파일 안에서 조건이 완전히 동일하고 그 사이에 공백/주석 외에 아무 것도
  없는 인접 `@media` 블록만 안전하게 병합(design.css 2쌍/screens.css 4쌍/aurora-theme.css 5쌍,
  총 11쌍). **1차 시도에서 정규식(`\s*(/\*.*?\*/\s*)*` + `fullmatch`)이 역추적(backtracking)
  때문에 실제 CSS 규칙이 낀 비인접 블록까지 "공백/주석만 있음"으로 잘못 판정해 `.bp-fab`
  위치 규칙과 채팅 레거시 타이틀바 숨김 규칙(`display:none!important`)이 엉뚱하게
  `@media(min-width:1200px)` 안에 갇히는 실제 회귀를 만들 뻔했다 — 커밋 전에 diff를 직접 읽다가
  발견해서 전체 되돌리고, 역추적 없는 수동 스캐너로 다시 작성 후 재적용.**
- 검증: 병합 전/후 컴파일된 `dist/assets/app-main-*.css`의 규칙(선택자+선언) 전체를 멀티셋으로
  비교해 위 두 기능 변경(hero corner fix, quick-nav 5개 규칙)을 제외하면 단 한 규칙도 추가/제거/
  변경되지 않았음을 확인(진짜 no-op). `npm run lint`, `npm run check:all`, `npm run safety:test`,
  `npm run regression:test` 전부 통과. Playwright 헤드리스로 390×844(모바일: 정사각 모서리 +
  퀵네비 확인)/820×1024/1440×900(PC: 퀵네비 숨김, 사이드 레일 유지 확인)에서 직접 스크린샷.
- 남은 작업: 같은 파일 내에서 조건은 같지만 사이에 다른 선택자 규칙이 끼어있어 "인접"하지 않은
  `@media` 블록들(더 많이 남아있음, 예: `design.css`의 흩어진 `min-width:1200px` 블록들)을
  안전하게 재정렬해서 합치려면 각 블록 사이에 있는 모든 선택자를 대조해 순서를 바꿔도 캐스케이드
  결과가 같은지 하나씩 증명해야 해서 이번 세션 범위 밖으로 남겨둠 — 리스크가 커서 별도 세션으로
  넘기는 것을 권장.

## 2026-09-18 15:58 KST

- 전수조사 착수: v2 CSS(`design.css` 438 / `screens.css` 874 / `aurora-theme.css` 165 /
  `chat-bubble-modules.css` 50 / `dest-layout.css` 25) + 레거시 `app.css` 1016개, 총 1500개+
  `!important` 및 구버전/신버전 디자인 혼용 지점을 전수조사(사용자 요청). 원본(`?id=cw`, `shell=v2`
  없는 URL)에 영향 주는 미스코프 v2 규칙은 없음을 확인(모든 v2 CSS 규칙이 `.v2-design`/`.bp-`/
  `.renewal-shell` 아래로 스코프됨 — 스크립트로 전수 검증).
- 첫 안전한 정리 커밋(`fix(v2): remove dead pre-v2-fs-token type-scale rules`): `design.css`에
  같은 파일 안에서 이미 완전히 덮어써지는(정확히 같은 선택자·같은 이상의 importance로 후속
  `--v2-fs-*` 토큰 블록이 재선언) "Gather type-scale remap" 구간(구 `--font-size-*` 토큰 기반,
  #630/#634/#635 시절 잔재)을 삭제. 파이썬으로 선택자별 전체 occurrence를 비교해 (a) 완전히
  가려지는 선언만, (b) importance가 later >= earlier인 경우만 추려서 골랐고, 컴파일된
  `dist/assets/app-main-*.css`에서 삭제 전후 승자 선언 값이 완전히 동일함을 직접 확인함(시각
  변화 없음, 순수 dead code 제거). `!important` 50개 제거(438→388).
- 검증: `npm run lint`, `npm run check:all`(lint+test+isolation+design-rules+design-system+
  architecture-budget 등 전체), `npm run safety:test`, `npm run regression:test`(build 포함)
  전부 통과.
- 남은 작업: 나머지 !important(레거시 컴포넌트 재사용으로 실제 필요한 것 다수 포함, 예:
  `.comment-composer`/`.festival-bar-*`/`.renewal-records-overview` 등 app.css 클래스 재사용
  케이스는 override를 위해 !important가 실제로 필요함) 및 `screens.css`/`aurora-theme.css`의
  동일 패턴(같은 파일 내 완전 가려진 선언) 추가 조사가 남아 있음. PC/모바일 웨일·삼성인터넷
  실기기 크로스브라우저 확인은 이 세션에서 불가(헤드리스 Chromium 근사만 가능) — 배포 후 사용자
  직접 확인 필요.

## 2026-09-18 16:xx KST (이어서)

- 같은 방법론(파일 내 선택자별 occurrence 비교, importance가 later >= earlier인 완전 가려짐만
  선별)을 `screens.css`/`aurora-theme.css`에도 적용해 2차 정리 커밋
  (`fix(v2): remove same-file shadowed !important duplicates`).
- 삭제한 8개 죽은 규칙: `.v2-chat-compose-tools`(2개 중복), `.participant-picker-button`(2개
  중복), `.settlement-person-grid`, `.settlement-metric-card-value`, `.bp-memo-grid`(값까지
  완전히 동일한 순수 복붙), `.v2-chat-message-content`(1200px 미디어쿼리 내 460px 잔재),
  `.bp-hero-zone`(풀블리드 규칙 완전 중복), `.bp-side-nav-head`(collapsed 상태 완전 중복).
  `screens.css` !important 라인 수 791→777, `aurora-theme.css` 164→162.
- 컴파일된 `dist/assets/app-main-*.css`를 수정 전/후로 각각 빌드해 대상 선택자 8개 전부의 최종
  승자 선언이 byte-identical함을 직접 diff로 확인(시각 변화 0).
- 검증: `npm run lint`, `npm run check:all`, `npm run safety:test`, `npm run regression:test`
  전부 통과.
- 3차 커밋(`fix(v2): remove remaining shadowed !important duplicates in design.css`):
  같은 파일 내 완전 가려짐 스크립트를 design.css에 재적용해 11개 추가 죽은 규칙 제거
  (`.bp-day-bar-stack .bp-day-anniversary`(767px), `.bp-side-nav-collapse-btn`(2겹),
  `.bp-attend-row-name`/`-note`, `.bp-day-num`(768/1200px 중복 2곳 + 베이스 1곳),
  `.bp-side-nav`(1200px width), `.bp-day-cell`(1200px), `.v2-page-header .bp-header-title`).
  `design.css` !important 388→374. 컴파일된 CSS diff로 제거된 라인 외에는 추가/변경 없음을 확인.
- **미해결로 남긴 진짜 충돌 1건(문서화만, 수정 안 함)**: `aurora-theme.css`의
  `@media (max-width: 767px)` 안에서 `.bp-hero-zone { border-radius: 16px !important; }`
  (142번째 줄 부근, Chromium 모바일 리페인트 성능 때문에 의도적으로 라운드 유지)가, 같은
  미디어쿼리 안의 또 다른 `.bp-hero-zone { border-radius: 0; }`(non-important, "full-bleed"
  의도로 보임)를 항상 이긴다. 이건 단순 죽은 코드가 아니라 실제로 화면에 영향을 주는 진짜
  충돌이라(모바일 히어로 카드가 지금 16px 라운드로 렌더링 중 — 0으로 바뀌어야 하는지는 디자인
  의도 확인 필요) 이번 세션에서는 임의로 고치지 않고 기록만 남김. 다음 작업자가 실제 모바일
  화면을 보고 의도를 확인한 뒤 결정할 것.

## 현재 상태 (2026-09-14 14:20 KST)

- 진행 중: 없음 (최신 안정화 유닛 및 Pages 배포 완료)
- 완료율: 현재 안정화 범위 100%
- 남은 작업: Vite 8 독립 회귀 검토, `app-main.js` 추가 분리 조사, 선택적 P1/P2 로드맵
- 원칙: 각 유닛마다 lint/build → 배포 → 라이브 확인 후 다음 유닛 진행
- 후속 로드맵: [post-v2-quality-roadmap.md](./post-v2-quality-roadmap.md)에 P0~P2 품질 개선과 완료 조건을 정리

## 2026-09-14 14:20 KST

- 상태 정정: 문서에 남아 있던 이전 커밋·75% 진행률 표기를 최신 운영 상태로 갱신.
- 최신 메인: `544c6ff7` 접근성 회귀 보완 커밋.
- 배포: GitHub Pages workflow 성공, `cw` 라이브 URL HTTP 200 확인.
- 안전성: 코드·Firebase·Storage 데이터 변경 없음. 다음 작업은 독립 브랜치와 동일한 유닛 검증 순서로 진행.

## 2026-09-14 14:24 KST

- 유닛: `app-main.js` 추가 분리 사전 조사
- 측정: `app-main.js` 8,860/12,250줄, `CalendarApp` 7,700줄. 사진·댓글·갤러리 관련 모듈은 이미 별도 import로 분리되어 있음.
- 판단: 캘린더 저장·라우팅·알림/PWA 상태를 즉시 재분리하면 부팅 순서와 사진·댓글 계약 회귀 위험이 있어 이번 유닛에서는 코드 변경을 보류.
- 다음: Vite 8은 별도 브랜치에서 업그레이드 후 전체 브라우저 회귀를 수행하고, 본체 분리는 기능 계약 테스트를 먼저 추가한 뒤 진행.

## 2026-09-14 14:28 KST

- 유닛: Vite/esbuild 경고 및 버전 재점검
- 확인: 저장소는 이미 Vite `8.2.2`, `@vitejs/plugin-react 6.1.1`을 사용 중이며 Node 엔진 조건도 충족.
- 빌드: production build 성공. 출력된 `vite:terser renderChunk` 메시지는 실패 경고가 아닌 플러그인 실행시간 안내이며 운영 번들 오류가 아님.
- 판단: 별도 Vite 8 업그레이드는 불필요. 다음 메이저 변경은 독립 브랜치에서만 검토.

## 2026-09-14 14:32 KST

- 유닛: 작업 현황 문서 stale 기록 전수 검색
- 결과: 현재 문서·스크립트에 과거 75% 진행률, 대기 중 커밋, Vite 8 미업그레이드 표기 등 운영 판단을 오해하게 만드는 활성 기록 없음. 과거 시점의 누적 로그는 이력 보존을 위해 유지.
- 판정: 추가 코드 변경 없이 문서 상태 일관성 확인 완료.

## 2026-09-14 14:36 KST

- 유닛: Vite `8.3.0` 격리 호환성 빌드
- 결과: 기존 소스와 `@vitejs/plugin-react 6.1.1` 조합으로 production build 성공. 예산 초과·런타임 변환 오류 없음.
- 안전성: package.json/lockfile/dist 변경 없이 `npm exec` 격리 실행. 운영 반영은 전체 브라우저 회귀를 포함한 별도 유닛으로 보류.

## 2026-09-14 14:42 KST

- 유닛: 전체 품질 게이트 재검증
- 결과: lint 경고 0, 단위 테스트 27/27, rules/egress/accessibility/isolation/design 검사 전부 통과, 아키텍처·번들 예산 통과, npm audit 취약점 0.
- 판정: 현재 main 안정성 기준 유지 확인. 코드·Firebase·Storage 데이터 변경 없음.

## 2026-09-14 14:48 KST

- 유닛: 최신 Pages 배포 후 라이브 smoke 재검증
- 결과: `cw·jhair·kkot` 주요 화면·공유 URL·관리자 URL·정적 청크 전체 200. `rebuildPhotoIndex` 405, `listPublicCalendarSummaries` 200, `kakaoLocalSearchProxy` 200, 사진 인덱스 트리거 인증 거부 401로 보안 계약 정상.
- 판정: 배포 성공과 실제 라이브 응답 일치 확인.

## 2026-09-14 10:42 KST

- 기준 메인: `ce75dd99`
- 완료: V2 5탭 셸, 캘린더/대화/정산 연결, 기록 서브탭 연결, 기록 전체 요약 허브
- 완료: 캘린더 홈에 일정·채팅·메모·갤러리·장소 요약 흐름 추가
- 검증: lint 통과, Vite build 통과, Pages 이전 배포 성공
- 진행 중: `ce75dd99` Pages 배포 및 라이브 확인
- 다음: 클로드 목업 기준 모바일/태블릿 세부 간격과 헤더·메뉴 시각 보정

## 2026-09-14 11:18 KST

- 점검: 채팅 타이핑 presence 발행·구독·렌더링 경로 확인
- 수정: 참여자 ID의 숫자/문자열 타입 혼재로 타이핑 행이 필터링될 수 있던 UI 매칭 정규화
- 검증: lint 통과, 단위 테스트 25개 통과
- 커밋: `591f5979`
- 다음: 두 브라우저에서 서로 다른 참여자로 입력하는 실기기 타이핑 표시 확인

## 2026-09-14 11:20 KST

- 요청 반영: 현재 사용자도 입력 중일 때 자신의 이름과 `…` 타이핑 말풍선을 표시
- 동작: 입력값이 비면 즉시 숨김, 전송·blur·유휴 타이머에서 기존 정리 로직으로 제거
- 검증: lint 통과, 단위 테스트 25개 통과
- 커밋: `71589d26`

## 2026-09-14 11:37 KST

- 요청 반영: 자기 타이핑 표시 행에 우측 정렬 클래스 적용
- 상대방 타이핑은 기존 좌측 정렬 유지
- 검증: lint 및 빌드 후 Pages 배포 예정

## 2026-09-14 11:31 KST

- 점검: 입력창 확대·썸네일·밈 키보드에서 마지막 말풍선이 가려지는 레이아웃 경로 분석
- 수정: 메시지 스크롤 영역 하단 여백에 composer 높이뿐 아니라 `--emoji-sheet-h`와 안전 여백 포함
- 기대 효과: 입력창/이모지 시트가 커져도 마지막 말풍선이 입력 UI 뒤로 중첩되지 않음
- 검증 예정: lint, 빌드, 모바일 viewport에서 입력창·키보드 조합 확인

## 2026-09-14 11:53 KST

- 점검: 네이버 블로그 `.gif?type=mp4w800` 링크의 실제 응답이 `video/mp4`임을 확인
- 수정: `mblogvideo-phinf.pstatic.net`의 `type=mp4` 링크를 직접 영상으로 판별
- 동작: 채팅 말풍선에서 음소거 자동재생·반복재생, 컨트롤로 소리 해제 가능
- 검증 진행: lint/build 및 브라우저 재생 동작 확인

## 2026-09-14 11:58 KST

- 수정: 외부 이미지·영상 로드/재생 실패 시 원본 출처로 이동할 수 있는 안내 링크 추가
- 적용 범위: 채팅 말풍선과 동일한 `DirectChatMediaText`를 사용하는 메모·검색 미디어
- 동작: 실패 감지 후 “원본 영상을/이미지를 재생할 수 없습니다 · 출처에서 확인” 표시

## 2026-09-14 12:43 KST

- 유닛: V2 기록·더보기 상태 UX 정리
- 수정: 더보기 안내 문구를 실제 동작과 일치하도록 갱신, 준비 중 문구의 내부 WP 노출 제거
- 수정: 로딩 상태에 접근 가능한 스피너와 `prefers-reduced-motion` 대응 추가
- 검증 예정: lint/build 및 Pages 배포 후 V2 기록·더보기 화면 확인

## 2026-09-14 13:08 KST

- 유닛: PC·모바일 3개 캘린더(kkot/cw/jhair) 브라우저 회귀 스모크
- 결과: Chromium 94/0, Firefox 93/0 통과. WebKit은 장소·갤러리 전환에서 Firestore `INTERNAL ASSERTION FAILED: Unexpected state`와 `Unexpected token '<'`가 반복되어 실패(19건).
- 판단: Chromium/Firefox 공통 기능 회귀는 확인되지 않았고, WebKit에서 Firestore Listen 취소·로컬 HTTP 프리뷰 응답 파싱 문제가 집중됨. 실패를 무시하지 않고 WebKit 단독 재현/원인 분리 대상으로 승격.
- 안전 조치: 데이터 쓰기·삭제 없이 읽기 전용으로 수행. 코드 변경 없이 현상 기록.

## 2026-09-14 13:28 KST

- WebKit 단독 재현 및 transport 플래그 실험
- 결과: Apple WebKit 자동감지를 강제 장기폴링으로 바꿔도 Firestore assertion이 재현되고 채팅 오류 범위가 증가함.
- 조치: 실험 변경 즉시 원복하여 운영 코드에 미반영. 단순 transport 설정 변경은 해결책으로 확정하지 않음.
- 다음: WebKit에서 중복 초기화·리스너 취소 순서를 추적하고, 재현 가능한 최소 수정만 별도 유닛으로 검증.

## 2026-09-14 13:34 KST

- 회귀 유닛 마무리: `npm run lint -- --quiet`, `npm test`
- 결과: lint 통과, 단위 테스트 25/25 통과.
- 운영 배포 확인: 문서 커밋 `ac14320d` Pages 배포 성공.
- 현재 판정: V2 공통 기능은 Chromium/Firefox에서 정상. WebKit Firestore 리스너 문제는 미해결로 유지하며 다음 분석 유닛으로 이월.

## 2026-09-14 13:52 KST

- 유닛 완료: WebKit Firestore/장소 화면 안정화
- 수정: WebKit `pageshow`에서 `enableNetwork()` 강제 토글을 생략해 Listen 스트림 assertion 방지; WebKit에서는 MapLibre 벡터 오버레이를 건너뛰고 OSM 래스터 폴백 사용.
- 검증: WebKit 94/0, lint 통과, 단위 테스트 25/25 통과.
- 안전성: Chromium/Firefox 경로와 기존 지도 데이터·Firestore 데이터는 변경하지 않음.

## 2026-09-14 14:10 KST

- 유닛 완료: WebKit 장소 지도 재검증
- 수정: WebKit에서 선택적 MapLibre 벡터 오버레이를 비활성화하고 기존 OSM 래스터 폴백 유지.
- 검증: WebKit 전체 94/94 통과(장소 PC·모바일 포함), `Unexpected token '<'` 0건.
- 다음: 세 캘린더 사진·댓글·태그 실데이터 회귀 및 V2 최종 판정.

## 2026-09-14 14:20 KST

- 유닛: `cw·jhair·kkot` 실데이터 미디어 계약 감사(read-only)
- 결과: 전체 1,301개 일정 사진, 1,071개 메시지, 87개 메모에서 잘못된 미디어 0건. 세 캘린더 모두 인덱스 누락 0·소유자 누락 0·뱃지 불일치 0.
- 잔여 관찰: `cw`에 부분 태그 캐시 1건과 인덱스에 없는 레거시 댓글 스레드 4건. 삭제/재작성 없이 레거시 alias 읽기 경로로 보존 중.
- 라이브 smoke: 주요 URL 200 응답 확인.

## 2026-09-14 14:42 KST

- 유닛 완료: V2 최종 브라우저 회귀
- 결과: Chromium 94/94, Firefox 93/93, WebKit 94/94 통과. 모바일·저속 3G·라이트박스 댓글 격리·세 캘린더 화면 포함.
- 배포 확인: `7f4e486d` Pages 배포 성공.
- 판정: V2 핵심 범위 100% 완료. 이후 작업은 [post-v2-quality-roadmap.md](./post-v2-quality-roadmap.md)의 별도 품질 개선 범위.

## 2026-09-14 15:05 KST

- 후속 유닛: 사진 댓글·태그 저장 회귀 방지 테스트
- 추가: 다중 이미지 메시지에서 공유 메타데이터가 있어도 댓글 키가 사진별로 분리되는 fixture, 실제 인덱스가 있는 행의 레거시 alias 보존 fixture.
- 검증: lint 통과, 단위 테스트 27/27 통과.
- 운영 데이터·Storage 변경: 없음.

## 2026-09-14 15:32 KST

- 후속 유닛: 외부 미디어 만료 fallback 재시도 UX
- 수정: 이미지·영상 로드 실패 시 `다시 시도` 버튼을 제공하고, 기존 원본 출처 링크를 함께 유지. 재시도마다 요소를 새로 마운트해 브라우저 캐시 오류를 재사용하지 않도록 처리.
- 적용: 채팅·메모·검색에서 공통 사용하는 `DirectChatMediaText`.
- 검증: lint 통과, 단위 테스트 27/27 통과, production build 성공. 외부 URL을 서버에 복제하지 않음.

## 2026-09-14 16:05 KST

- 후속 유닛 완료: fallback 변경 후 브라우저 회귀
- 검증: Chromium 전체 94/94 통과(PC·모바일·저속 3G·세 캘린더 포함), 실패 0건.
- 판정: 외부 미디어 재시도 UI가 기존 화면·라이트박스·댓글 키 격리를 깨뜨리지 않음.

## 2026-09-14 16:32 KST

- 후속 유닛: 라이브 배포 경로 smoke 확대
- 검증: GitHub Pages 주요 캘린더·뷰 URL 200 응답, Chromium 전체 94/94 통과.
- 확인 범위: `cw·jhair·kkot` 메인/채팅/갤러리/장소/메모/정산/보관함/콘텐츠, PWA manifest, 저속 3G 부팅.
- 현재: Pages 최신 커밋 배포 워크플로 완료 대기.

## 2026-09-14 16:48 KST

- 최종 유닛: 전체 정적 안전성·예산·보안 체크
- 결과: `check:all` 전체 통과, lint 경고 0, 단위 테스트 27/27, npm audit 취약점 0, 번들·아키텍처 예산 통과.
- 판정: V2 핵심 및 P0 안정화 범위 완료. 남은 항목은 권리 확인형 미디어 보관·관측성 등 선택적 P1/P2 로드맵.

## 2026-09-14 17:05 KST

- P1 유닛: 이미지·영상 번들/지연 로딩 기준선 측정
- 결과: 전체 JS 1,389,606/1,500,000바이트(여유 7.4%), CSS 138,004/240,000바이트. 지도·관리자·갤러리·채팅 화면 청크는 지연 로딩으로 분리되어 초기 총량에서 제외.
- 검증: `check:dist-budget`, `check:size-budget` 통과. 예산 초과 없음.
- 다음: 초기 번들 여유를 확보하기 위한 화면별 지연 로딩 후보를 정적 분석.

## 2026-09-14 17:22 KST

- P1 유닛: 추가 지연 로딩 후보 정적 분석
- 결과: 장소·관리자·갤러리·채팅·이벤트 모듈은 이미 동적 청크로 분리되어 있음. `app-main`에서 정적 import 중인 사진·댓글·부트스트랩·라우팅 모듈은 초기 상태 오케스트레이션과 강하게 결합되어 있어 추가 분리 시 부팅 순서/댓글 계약 회귀 위험이 큼.
- 판정: 이번 유닛에서는 코드 변경을 보류하고, 다음 구조 분리는 V2 안정화와 별도 브랜치에서 진행하는 것으로 결정.
- 안전성: 번들·아키텍처 예산은 현재 통과 상태 유지.

## 2026-09-14 17:40 KST

- P1 유닛: 타이핑 presence 보호 재점검
- 결과: heartbeat 4초·idle 2.5초·TTL 10초, 세션별 문서 격리, 참여자 dedupe, 만료 정리 상한(최대 8건), 권한/네트워크 오류 graceful degradation이 코드와 테스트에 반영되어 있음.
- 검증: `npm run safety:test` 통과, 단위 테스트 27/27 통과.
- 판정: 추가 수정 없이 현재 계약 유지.

## 2026-09-14 18:00 KST

- P2 유닛: 관측성·오류 집계 개인정보 안전성 검토
- 결과: `queueServerAuditEvent` 호출은 캘린더/오류 코드/지연 상태 중심이며 메시지 본문·사진·댓글을 전달하지 않음. 댓글·미디어 fallback 오류는 사용자 화면에서만 안내되고 원문 콘텐츠는 로그에 남기지 않음.
- 검증: `safety:test`, `check:all` 통과 상태 재확인.
- 판정: 신규 telemetry 도입 없이 현재 감사 이벤트 계약 유지.

## 2026-09-14 18:20 KST

- P2 유닛: 권리 확인형 외부 미디어 보관 안전성 점검
- 결과: 외부 URL을 자동으로 Firebase Storage에 복제하는 경로 없음. 외부 미디어는 URL·태그·미리보기 메타데이터만 저장하며, 업로드는 사용자가 직접 첨부한 파일 경로로 제한됨.
- 판정: 사용자 동의·권리 확인·용량 제한 UI 없이 미러링 기능을 새로 활성화하지 않음.

## 2026-09-14 18:45 KST

- 최종 유닛: 운영 배포 전 `predeploy` 전체 검증
- 결과: check:all·Firebase safety·production build·dist budget 전부 통과. lint 경고 0, 단위 테스트 27/27, npm audit 취약점 0.
- 판정: 현재 메인 상태는 안전한 배포 기준 충족. 추가 기능은 별도 유닛/브랜치로 진행.

## 2026-09-14 16:55 KST

- P1 유닛: V2 캘린더 홈 갤러리 요약 인덱스 연결 보완
- 원인: 사진 인덱스 훅이 `gallery`·`history` 화면에서만 조회되어 캘린더 홈의 갤러리 스트립이 항상 빈 상태로 남음
- 수정: 캘린더 홈에서도 canonical `photoIndex` 1페이지를 warm-up 조회해 최근 썸네일 6개를 동일 인덱스 계약으로 표시
- 검증: lint·단위 테스트 27/27·production build·dist budget 통과, Pages 배포 성공, `cw&shell=v2` 라이브에서 사진 버튼 6개 및 빈 상태 문구 미표시 확인
- 커밋: `091b8149`

## 2026-09-14 17:02 KST

- P1 유닛: 라이트박스 연속 태그 입력 포커스 유지
- 수정: 태그 입력 중 Tab·이전/다음 화살표로 사진을 전환하면 새 사진의 태그 입력 필드가 자동 포커스되도록 보완
- 안전장치: 일반 영역으로 포커스를 옮긴 경우에는 자동 복원하지 않으며, 저장·댓글·사진 식별 계약은 변경하지 않음
- 검증: lint·단위 테스트 27/27·production build·dist budget 통과
- 커밋: `1f9a0ce3`, Pages 배포 및 브라우저 회귀 확인 중

## 2026-09-14 17:18 KST

- P1 유닛: 채팅·갤러리 이미지 업로드 날짜 태그 보장
- 원인/보완: 일부 photoIndex 행이 denorm 지연으로 빈 태그를 노출할 수 있어, 업로드 저장 시 메타데이터 결과가 비어도 `withUploadDateTag`로 오늘의 `#YYMMDD`를 반드시 기록
- 라이트박스: 원본 태그가 아직 인덱스에 반영되지 않은 경우 업로드 시각 기반 날짜 태그를 표시하는 안전한 읽기 보완 유지
- 범위: 기존 태그·댓글·사진 식별 및 meme 스티커 제외 정책 변경 없음
- 검증: lint·단위 테스트 27/27·production build·dist budget 통과
- 커밋: `2a1fc67d` (코드), Pages 배포 대기

## 2026-09-14 17:30 KST

- P1 유닛: 라이트박스 원본 이미지 실패 시 썸네일 유지
- 원인: 원본 URL만 만료·차단되어도 이미 로드된 썸네일까지 오류 플레이스홀더로 교체됨
- 수정: 원본 실패 URL을 세션 내 기록하고 유효한 썸네일을 계속 표시; 썸네일까지 실패한 경우에만 오류 화면 노출
- 검증: lint·단위 테스트 27/27·production build·dist budget 통과
- 운영 데이터·Storage 변경 없음

## 2026-09-14 17:32 KST

- 회귀 검증: Firefox 단독 브라우저 스모크
- 결과: PC·모바일·`cw·kkot·jhair` 주요 화면 및 라이트박스/태그/댓글 격리 93/93 통과
- 판정: 앞서 병렬 실행 간섭으로 발생한 메모 태그 입력 타임아웃은 재현되지 않음

## 2026-09-14 19:10 KST

- 최종 라이브 smoke 계약 보정
- 수정: `kakaoLocalSearchProxy`의 현재 정상 200 coordinate-mode 응답을 smoke 기준에 반영(기존 400/query required 계약 제거).
- 검증: 라이브 주요 경로·정적 청크·Cloud Functions probe 전체 통과(`Live smoke check passed`).

## 2026-09-14 19:30 KST

- 추가 점검: 전체 검색 하이라이트·V2 디자인 시스템 계약
- 결과: 캘린더/채팅/메모/장소/보관함/관리자 검색이 공통 하이라이트 헬퍼를 사용하며, 디자인 토큰·모바일 입력 규격·공유/라이트박스 구조 규칙이 모두 통과.
- 검증: `check:design-rules`, `check:design-system` 통과. 코드 변경 없음.

## 2026-09-14 20:00 KST

- 소규모 접근성 유닛: 외부 미디어 fallback 포커스 표시
- 수정: `다시 시도` 버튼과 출처 링크에 `:focus-visible` 고대비 outline 추가.
- 검증: lint·design-rules·accessibility-safety 통과.

## 2026-09-14 20:40 KST

- 접근성 보완 후 운영 회귀 검증
- 결과: production build 성공, Chromium 94/94 통과(PC·모바일·저속 3G·세 캘린더).
## 2026-09-14 15:24 KST

- V2 디자인 유닛: 데스크톱 홈 요약을 목업에 맞춘 2열 카드형 정보 구조로 보강
- 범위: 채팅·메모·장소 카드와 갤러리 스트립의 시각 스타일만 변경; 데이터 조회·사진/댓글 계약은 변경하지 않음
- 반응형: 1024px 이상에서만 카드 그리드 적용, 모바일·태블릿 기존 3열 갤러리 흐름 유지
- 검증: `npm run lint`, `npm test` (27/27), `npm run build`, `npm run check:dist-budget` 통과
- 다음: 라이브 Pages 배포 확인 후 목업 대비 타이포그래피/간격 세부 조정
## 2026-09-14 15:34 KST

- 라이브 전체 경로 smoke 재검증: cw/kkot/jhair 캘린더·채팅·메모·장소·갤러리·관리자·공유 경로 200
- 정적 Vite 청크 및 핵심 Cloud Functions probe 통과
- 판정: `cae173ce` 태블릿 썸네일 변경 이후 운영 회귀 없음
## 2026-09-14 15:50 KST

- 브라우저 전체 회귀 완료: Chromium 94/94, Firefox 93/93, WebKit 93/93 통과
- PC·모바일 및 `cw·kkot·jhair` 주요 화면/메뉴 전환·저속 3G 부팅 검증 완료
- Firebase safety test 통과, 외부 리소스 경고는 테스트 fixture의 의도된 경고로 기능 실패 아님

## 2026-09-14 18:09 KST

- P0 디자인 유닛 완료: V2 캘린더 홈에 인디고→보라→민트 그라디언트 헤더, 은은한 페이지 배경, 최대 1,180px의 둥근 캘린더 카드와 데스크톱 레일 그림자를 적용.
- 범위: `src/app.css`, `src/ui/ui-app-shell-v2.js`의 `is-calendar` modifier에만 시각 규칙을 제한. 사진·태그·댓글·Firestore 데이터 계약과 다른 V2 탭 레이아웃은 변경하지 않음.
- 아키텍처 가드: 선행 업로드 날짜 태그 변경이 늘린 설명 주석 두 줄을 `src/core/app-main.js`에서 한 줄씩 접어 `CalendarApp` 동결 상한을 7,702→7,700줄로 복원(실행 로직 변경 없음).
- 반응형 확인: 375×812, 768×1024, 1024×900, 1440×900 캡처 완료. 375/768은 하단 내비게이션, 1024/1440은 사이드 레일을 사용하며 홈 갤러리 사진 6개와 태블릿·모바일 3열 계약 유지.
- 검증: `check:all`, production build, dist/architecture/design budget 통과. 충돌 없는 전용 preview 포트에서 Chromium 94/94, Firefox 93/93, WebKit 93/93 통과.
- 배포: 코드 커밋 `599b0304`, Pages `34826051653` 및 Verify Calendar `34826051662` 성공. 캐시 버스트 라이브에서 그라디언트 헤더, 16px 캘린더 카드, 데스크톱 18px 헤더 radius, 사진 6개를 확인했고 `smoke:live` 통과.
- 다음: 홈 요약 카드의 제목/본문/보조문구 타이포그래피와 카드 내부 여백을 목업에 맞추는 독립 P0 유닛.

## 2026-09-14 18:24 KST

- P0 디자인 유닛 완료: 홈 채팅·메모·갤러리·장소 요약 섹션을 독립 카드로 만들고 14px 외곽 radius, 16px 내부 여백, 공통 얇은 테두리·그림자와 제목/본문/보조문구 간격을 적용.
- 범위: `src/app.css`의 V2 홈 요약 스타일만 변경. 데이터 조회, 사진·태그·댓글 identity, Firestore/Storage 계약은 변경하지 않음.
- 직접 검토: 375×812·768×1024·1024×900·1440×900에서 overflow 0. 모바일 하단 내비게이션, 데스크톱 사이드 레일, 6개 홈 갤러리 썸네일 확인.
- 검증: `check:all`, production build, 번들·아키텍처·디자인 가드 통과. 전용 preview에서 Chromium 94/94, Firefox 93/93, WebKit 94/94 통과.
- 배포: 코드 커밋 `ef4032b5` Pages 배포 `34827464119`, Verify Calendar `34827464048` 성공. 캐시 버스트 라이브 URL에서 카드 radius/padding/shadow와 사진 6개를 직접 확인.
- 다음: 캘린더 홈 카드의 세부 타이포그래피·D-day 요약 영역을 목업과 대조하는 다음 독립 유닛. `shell=v2` 플래그는 유지.

## 2026-09-14 18:42 KST

- P0 디자인 유닛 완료: 홈 요약 제목·본문·보조문구·장소 아이콘 텍스트를 `--font-size-*` 기반 공통 토큰으로 정렬하고 행간을 안정화.
- 범위: `src/app.css`의 V2 홈 요약 타이포그래피 변수와 선택자만 변경. 사진·태그·댓글·Firestore/Storage 계약은 변경하지 않음.
- 직접 검토: 캐시 버스트 라이브 URL에서 제목 13.6px, 본문 12.8px, 메타 11.52px, 갤러리 썸네일 6개를 확인. 모바일 캡처를 저장함.
- 검증: `check:all`, production build 및 dist 예산 통과. Pages 배포 전 Chromium 브라우저 스모크 통과.
- 배포: 코드 커밋 `69a6e29e`, Pages `34828327007`, Verify Calendar `34828327051`(verify/live-smoke) 모두 성공.
- 다음: 캘린더 홈 D-day/상단 요약 영역을 목업과 대조하는 독립 P0 유닛. `shell=v2` 플래그는 유지.

## 2026-09-14 19:06 KST

- P0 디자인 유닛 완료: V2 캘린더 홈의 가까운 일정 영역을 독립 카드 표면으로 정리하고 D-day 배지를 인디고→보라 그라디언트로 보강. hover/focus-visible 상태와 텍스트 행간을 추가해 키보드 탐색 시에도 동일한 계층을 유지.
- 범위: `src/app.css`의 `.renewal-shell-upcoming-*` 및 캘린더 셸 한정 규칙만 변경. 일정 선택 핸들러와 날짜 데이터, 사진·태그·댓글·Firestore/Storage 계약은 변경하지 않음.
- 검증: `check:all`, production build, dist/architecture budget 통과. Pages 배포 전 브라우저 smoke를 통과했고 Verify의 정적 회귀·live-smoke도 성공.
- 배포: 코드 커밋 `15de76dc`, Pages `34829145146`, Verify Calendar `34829145152`(verify/live-smoke) 성공. 캐시 버스트 URL에서 V2 플래그 유지 상태를 확인.
- 다음: 4개 뷰포트 시각 회귀 스냅샷을 기준으로 전체 P0 승인 여부를 검토. `shell=v2` 플래그는 유지.

## 2026-09-14 19:34 KST

- 모바일 5탭 직접 전환 테스트에서 발견한 레이어 회귀를 수정: 채팅 화면의 고정 컨테이너가 하단 내비게이션 클릭을 가로채던 문제를 V2 내비게이션 `z-index:1100`으로 해결.
- 범위: `src/app.css`의 V2 하단 내비게이션 레이어 규칙만 변경. 채팅 입력·메시지·사진·태그·댓글 데이터 계약은 변경하지 않음.
- 직접 검토: 라이브 캐시 버스트 URL에서 대화→기록 전환 성공, 기록 허브 텍스트 노출, 하단 내비게이션 z-index 1100 확인.
- 검증/배포: `npm run lint -- --quiet`, `check:design-system`, build/dist 예산 통과. 코드 `62b14cfa`, Pages `34829986501`, Verify Calendar `34829986529`(verify/live-smoke) 성공.
- 다음: 5탭 전환과 4개 뷰포트 스냅샷을 릴리스 승인 체크리스트에 반영. `shell=v2` 플래그는 유지.

## 2026-09-14 20:02 KST

- P0 시각 유닛 완료: V2 모바일 하단 탭 활성 상태에 은은한 인디고 그라디언트를, 데스크톱 사이드 레일 활성 상태에 인디고 인셋 라인을 적용해 목업의 선택 계층을 통일.
- 범위: `src/app.css` 내 V2 내비게이션 선택자만 변경. 탭 라우팅·데이터·사진·태그·댓글 계약은 변경하지 않음.
- 직접 검토: 캐시 버스트 라이브에서 활성 탭 색상 `rgb(79,70,229)`, 하단 내비게이션 `z-index:1100`, 활성 배경 그라디언트를 확인.
- 검증/배포: lint, design-rules, production build/dist 예산 통과. 코드 `3514f67a`, Pages `34830974897`, Verify Calendar `34830974924` 성공.
- 다음: 릴리스 승인 체크리스트와 기본 셸 전환 여부를 별도 검토. `shell=v2` 플래그는 유지.

## 2026-09-14 20:24 KST

- 읽기 전용 릴리스 spot-check 완료: `cw`, `jhair`, `kkot` 모두 V2 캘린더 홈·캘린더 카드·갤러리 썸네일 6개·기록 탭 진입 성공.
- 세 캘린더에서 렌더/오류 문구가 없었고 사진·태그·댓글·Firestore 데이터는 변경하지 않음.
- 기존 4개 뷰포트 스냅샷과 전체 브라우저 smoke 결과를 합쳐 시각 승인 자료를 최신화. 승인 전까지 기본 셸 전환 및 `shell=v2` 제거는 보류.

## 2026-09-14 21:12 KST

- 데이터 무결성 수정: `unionConfirmedMeetings`와 `mergeConfirmedMeetings`에서 정산 전용 `confirmed:false` 행이 기존 확정 모임을 `전원`으로 강등하지 않도록 양측의 `confirmed:true`를 보존.
- 회귀 테스트 1건 추가(총 28개): 확정 모임 + 정산 전용 false 행 병합 시 `confirmed:true`와 비용 항목이 모두 유지되는지 검증.
- 직접 라이브 확인: `cw` V2 캐시 버스트 화면에서 `확정` 표시 7건, `전원` 표시 1건을 확인하고 렌더 오류 없음.
- 검증/배포: `check:all` 및 Pages/Verify 성공. 코드 `1a4a5e33`, Pages `34837158919`, Verify Calendar `34837158926`.
- 사진·태그·댓글·Storage 데이터는 읽기 전용으로 유지했으며 일괄 수정/삭제/재업로드는 수행하지 않음.

## 2026-09-15 10:28 KST

- 시안 대조 기반 P0 스타일 유닛: Bento 홈의 보라→민트 히어로/평면 벤토 표면과 Chat·Memo·Places·Settlement의 흰색 집중형 헤더 토큰을 V2 셸에 적용.
- 범위: `src/app.css`의 V2 전용 스타일만 변경. Firebase/Storage, 메시지·사진·태그·댓글·일정 데이터와 기존 컴포넌트 로직은 변경하지 않음.
- 직접 검토: Pages 캐시 버스트 URL에서 `tab=chat`의 흰색 헤더·`#FAFAFC` 배경, `tab=calendar`의 히어로 그라디언트와 홈 카드 표면을 확인.
- 검증: lint, 테스트 28개, production build, dist budget, architecture budget 통과.
- 배포: 코드 커밋 `ebe25c78`, Pages 배포 성공 확인. 라이브 CSS 청크 `index-rCMWn-L4.css` 및 V2 URL 응답 확인.
- 다음: ChatFull/MemoFull/PlacesFull/SettlementFull 각각의 카드·타이포그래피·반응형 폭을 화면별 독립 유닛으로 맞춤. `shell=v2` 플래그 유지.

## 2026-09-15 11:33 KST

- 시안 대조 후 잔여 V2 화면 스타일 유닛을 반영: Bento 홈의 단일 연속 히어로 그라디언트·컴팩트 디데이(heartbeat/펼침 상세)·bleed 갤러리, Chat/Memo/Places/Settlement의 화면별 폭·카드·검색/탭 표면을 적용.
- 범위: `src/app.css`, `src/ui/ui-app-shell-v2.js`의 V2 전용 표현만 변경. Firebase/Storage 및 원본 메시지·사진·태그·댓글·일정 데이터는 읽기/쓰기 모두 변경하지 않음.
- 직접 검증: Chromium 브라우저 스모크 106/106 통과(PC·모바일, kkot/cw/jhair, V2 5탭·기록 서브탭·사이드메뉴 전환), 라이브 smoke 200 응답 및 청크 마커/Cloud Function 확인.
- 검증: `npm run check:all`(lint·28 tests·보안/예산/아키텍처/CI 시나리오/npm audit) 통과, `CALENDAR_SMOKE_BROWSER=chromium npm run smoke:browser` 106 passed.
- 배포: 코드 `b63bb2a1`, Deploy Vite Pages 및 Verify Calendar 성공. 최신 확인 URL: `https://pyw31337.github.io/calendar/?id=cw&shell=v2&v=b63bb2a1` (`shell=v2` 유지).

## 2026-09-15 12:08 KST

- 피드백 반영: 모바일 Bento 홈 하단 채팅·메모·갤러리·장소를 개별 카드로 그룹핑하지 않고 시안처럼 edge-to-edge 세로 흐름으로 변경. PC/태블릿에서만 카드 프레임과 2열 배치를 유지.
- 범위: `src/app.css`, `src/ui/ui-app-shell-v2.js`의 V2 홈 표현만 변경. 데이터·Firebase·Storage·사진·태그·댓글 계약은 변경하지 않음.
- 검증: lint, 테스트 28개, build/dist budget, Chromium 스모크 106/106 통과.
- 배포: 코드 `617d589f` 후속 스타일 수정 커밋을 배포 중이며, 완료 후 최신 cachebuster URL로 확인.

## 2026-09-15 13:31 KST

- 첨부된 BentoPinkFinal PC·태블릿·모바일 시안을 다시 대조해 V2 홈을 반응형으로 재구성: 모바일은 외곽 카드 없이 edge-to-edge 세로 흐름, 태블릿은 2열, PC는 채팅·메모·갤러리 3열과 장소의 다음 행 배치를 적용.
- 단일 보라→민트 히어로 안에 헤더·D-day 스트립을 정렬하고, 캘린더 높이·평면 셀·참여자 점/이름 배지·확정 일정 하단 바를 뷰포트별로 조정. 홈 채팅·메모 링크 미리보기·8장 갤러리·장소·푸터의 간격과 표면도 시안 규칙에 맞춤.
- 직접 검토 중 홈 갤러리가 인덱스의 `thumb/full` 필드를 읽지 못해 빈 칸으로 보이던 회귀를 발견해 표시 필드 fallback을 복구. 실제 8개 이미지 모두 `naturalWidth > 0` 로딩을 확인.
- 범위: `src/app.css`, `src/ui/ui-app-shell-v2.js`의 V2 표시 로직만 변경. Firebase/Storage 및 원본 메시지·사진·태그·댓글·일정 데이터는 쓰거나 변경하지 않음. 제공된 `designv2/` 원본도 미추적 상태로 보존.
- 검증: 배포 대상 소스 lint, 테스트 28/28, production build, dist/architecture budget, Chromium 브라우저 스모크 106/106 통과. PC 1440×900, 태블릿 887×1024, 모바일 478×812에서 직접 캡처 비교 및 가로 overflow 0 확인.
- `shell=v2` 플래그는 유지하며 이 유닛 배포 후 cachebuster URL에서 다시 확인 예정.
