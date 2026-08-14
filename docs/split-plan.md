# 모여라 캘린더 코드 분리 설계

## 운영 원칙

- 라이브 서비스 중단을 막기 위해 한 번에 대규모 JS 분리를 하지 않는다.
- 각 단계는 `npm run build`, `npm run regression:test`, GitHub Pages 배포, 라이브 URL 확인을 통과해야 다음 단계로 넘어간다.
- 분리 전 정상 커밋은 원격 태그로 보존한다.
- 데이터 저장/읽기 경로는 리팩터링 단계에서 변경하지 않는다. Firestore 스키마 변경은 별도 작업으로만 진행한다.

## 현재 완료된 단계

- 1단계: `index.html`의 대형 인라인 CSS를 `assets/app.css`로 분리했다.
- 2단계: 색상/정산 카테고리/도메인 액션 상수를 `assets/app-constants.js`로 분리했다.
- 3단계: Firebase 로딩 타임아웃, 이미지 제한, admin 세션 같은 런타임 설정을 `assets/app-config.js`로 분리했다.
- 4단계: 한국 공휴일/24절기/월 이름 데이터를 `assets/app-calendar-data.js`로 분리했다.
- 5단계: 채팅 이모지/HEIC CDN/링크 미리보기 한도 데이터를 `assets/app-chat-data.js`로 분리했다.
- 6단계: `INITIAL_CALENDARS`에 남아 있던 과거 데모 참여자/일정 데이터를 제거하고, 빈 로딩 셸만 남겼다.
- 외부 JS는 모두 `public/assets`에도 미러링한다. Vite 산출물과 GitHub Pages 루트 서빙 방식이 달라져도 파일 누락을 막기 위한 조치다.
- 각 외부 JS는 `window.GATHER_APP_*` 네임스페이스로만 값을 노출하고, `index.html`에는 기존 값 fallback을 유지한다.
- `npm run regression:test`에 `check:asset-mirrors`가 포함되어 root/public 미러 불일치, `index.html`의 누락 asset 참조, 외부 데이터 스크립트 로딩 순서, 과거 초기 데모 데이터 재유입을 잡는다.
- 복구 기준 태그: `safe-before-split-20260814-7da2504`

## 다음 권장 단계

### 7단계: 순수 유틸 함수 분리

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
- 함수 이동 시 기존 함수명을 바로 삭제하지 말고, 최소 1단계는 `window.GatherUtils?.fn || fallbackFn` 형태로 유지한다.

### 8단계: Firebase 서비스 계층 분리

대상:
- 캘린더 구독
- 채팅 구독
- 이미지 업로드 URL 처리
- 푸시 구독 등록/해제

방식:
- `assets/firebase-services.js`에 `window.GatherFirebaseServices`로 분리한다.
- Firestore document path 규칙은 기존 코드와 완전히 동일하게 유지한다.
- `?id=kkot`, `?id=cw`, `?id=jhair` 간 데이터 격리를 회귀 테스트에 포함한다.

### 9단계: UI 컴포넌트 단위 분리

대상 우선순위:
- `ShareModal`, `ConfirmDialog`, `NotificationPermissionHelpModal` 같은 독립 모달
- `MainSideMenu`, `ChatSideMenu`
- `Lightbox`
- `SettlementSummaryModal`

방식:
- 현재 앱은 CDN React + 인라인 `React.createElement` 실행 구조이므로, 즉시 ES Module JSX 구조로 바꾸면 위험하다.
- 먼저 전역 컴포넌트 파일로 분리한 뒤, 최종적으로 Vite `src/` 기반 앱으로 전환한다.

### 10단계: Vite 앱 구조 전환

대상:
- `src/`를 실제 라이브 엔트리로 전환
- `index.html`에는 루트와 외부 스크립트 로더만 남긴다.

필수 조건:
- 로컬/라이브 기능 회귀 테스트가 충분히 확보된 뒤 진행한다.
- 전환 직전 별도 복구 태그를 생성한다.
- 전환 PR 또는 커밋은 단일 목적이어야 한다.

## 주의해야 할 남은 위험구간

- `src/`에는 과거 Vite/React 구조의 `localStorage` 기반 파일이 남아 있다. 현재 라이브 엔트리는 `index.html`이지만, 최종 Vite 구조 전환 전에 폐기 또는 현대화 여부를 별도 커밋으로 결정한다.
- `PEEKALINK_PROXY_URL`은 `firebaseConfig.projectId`에 의존하는 런타임 계산값이라 정적 데이터 파일로 빼지 않았다.

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
