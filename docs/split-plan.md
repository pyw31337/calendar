# 모여라 캘린더 코드 분리 설계

## 운영 원칙

- 라이브 서비스 중단을 막기 위해 한 번에 대규모 JS 분리를 하지 않는다.
- 각 단계는 `npm run build`, `npm run regression:test`, GitHub Pages 배포, 라이브 URL 확인을 통과해야 다음 단계로 넘어간다.
- 분리 전 정상 커밋은 원격 태그로 보존한다.
- 데이터 저장/읽기 경로는 리팩터링 단계에서 변경하지 않는다. Firestore 스키마 변경은 별도 작업으로만 진행한다.

## 현재 완료된 1단계

- `index.html`의 대형 인라인 CSS를 `assets/app.css`로 분리했다.
- HTML은 `<link rel="stylesheet" href="assets/app.css?v=20260814-split1">`로 외부 CSS를 로드한다.
- JS 실행 순서와 Firebase/React 로딩 순서는 변경하지 않았다.
- 복구 기준 태그: `safe-before-split-20260814-7da2504`

## 다음 권장 단계

### 2단계: 순수 유틸 함수 분리

대상:
- 색상/대비 계산
- 날짜 포맷
- URL 파싱/정규화
- 로컬 환경 감지
- 브라우저 권한 안내 문구

방식:
- `assets/app-utils.js`를 먼저 만들고 `window.GatherUtils`에 노출한다.
- 기존 `index.html` 안에서는 한 번에 삭제하지 않고, 먼저 `const { ... } = window.GatherUtils` 별칭만 붙여 동작을 확인한다.
- 한 묶음당 5~10개 함수 이하로만 이동한다.

### 3단계: Firebase 서비스 계층 분리

대상:
- 캘린더 구독
- 채팅 구독
- 이미지 업로드 URL 처리
- 푸시 구독 등록/해제

방식:
- `assets/firebase-services.js`에 `window.GatherFirebaseServices`로 분리한다.
- Firestore document path 규칙은 기존 코드와 완전히 동일하게 유지한다.
- `?id=kkot`, `?id=cw`, `?id=jhair` 간 데이터 격리를 회귀 테스트에 포함한다.

### 4단계: UI 컴포넌트 단위 분리

대상 우선순위:
- `ShareModal`, `ConfirmDialog`, `NotificationPermissionHelpModal` 같은 독립 모달
- `MainSideMenu`, `ChatSideMenu`
- `Lightbox`
- `SettlementSummaryModal`

방식:
- 현재 앱은 CDN React + 인라인 `React.createElement` 실행 구조이므로, 즉시 ES Module JSX 구조로 바꾸면 위험하다.
- 먼저 전역 컴포넌트 파일로 분리한 뒤, 최종적으로 Vite `src/` 기반 앱으로 전환한다.

### 5단계: Vite 앱 구조 전환

대상:
- `src/`를 실제 라이브 엔트리로 전환
- `index.html`에는 루트와 외부 스크립트 로더만 남긴다.

필수 조건:
- 로컬/라이브 기능 회귀 테스트가 충분히 확보된 뒤 진행한다.
- 전환 직전 별도 복구 태그를 생성한다.
- 전환 PR 또는 커밋은 단일 목적이어야 한다.

## 검수 체크리스트

- 메인 캘린더: 월 이동, 날짜 선택, 일정 등록/수정/삭제
- 캘린더별 데이터 격리: `kkot`, `cw`, `jhair`
- 채팅: 전송, 이미지 업로드, URL 미리보기, 알림 권한 안내
- 갤러리/라이트박스: 열기, 닫기, 뒤로가기, URL 복사
- 투표: 표시, 투표, 취소, 확정 표시
- 정산하기: 누적보기, 일자별보기, 카테고리, 폴딩
- 메모: 목록, 작성, 수정, 삭제, 검색
- 어드민: 일반, 통계, 로그, 복구, 통합검색
- PC 폭: 1440px 이상, 1024px, 768px
- 모바일 폭: 390px, 430px
- 브라우저: Chrome, Whale, Firefox, Safari 계열은 실제 기기 또는 브라우저별 수동 확인 필요

