# Codex 인수인계 — V2 디자인 업그레이드 재개

작성: 2026-09-14 KST  
대상 라이브: [cw V2](https://pyw31337.github.io/calendar/?id=cw&shell=v2)

## 1. 현재 상태 요약

사용자 요청은 **“V2 디자인이 실제 화면에 보이지 않는다”**는 것이다. 현재 배포본에는 V2 셸과 기능 연결이 들어가 있지만, Claude 목업과의 시각적 패리티는 완료되지 않았다. 따라서 기능 안정화 완료를 디자인 완료로 보고해서는 안 된다.

- 현재 `main`: `4770df62` (문서 커밋 기준)
- 최신 코드 배포: `5977f4d1` 이후 Pages 배포 성공
- 백그라운드 작업: 없음
- V2 기능 안정화: 완료
- 시각 디자인 패리티: 약 70% (미완료)
- V2 진입 URL: `?id=cw&shell=v2`; 기본 URL은 기존 셸일 수 있으므로 V2 확인 시 반드시 `shell=v2`를 붙인다.

## 2. 이미 반영·검증된 기능

다음 기능은 디자인 작업 중에도 보존해야 한다.

1. 홈 갤러리: `useGalleryPhotoIndex`가 캘린더 홈에서도 인덱스를 warm-up한다. `cw` 인덱스 676행이 존재하며 V2 홈에서 썸네일 6개가 표시되는 것을 확인했다.
2. 사진 계약: 사진 식별자는 `messageId + imageIndex` 또는 고유 asset/ref 키를 사용한다. 메시지 하나만으로 dedupe하면 안 된다.
3. 라이트박스: 원본 URL 실패 시 썸네일을 유지하고, 썸네일까지 실패할 때만 오류 플레이스홀더를 표시한다.
4. 태그: 채팅 이미지 업로드 시 Asia/Seoul 기준 `#YYMMDD`가 항상 원본 `imageTags`에 저장된다. 인덱스가 늦으면 라이트박스가 날짜 태그를 표시한다.
5. 라이트박스 태그 연속 입력: Tab/화살표로 다음 사진으로 이동해도 태그 입력 포커스를 유지한다.
6. 댓글/뱃지·사진 인덱스: `photoIndex`는 목록·집계용이며 원본 메시지/메모가 태그·댓글의 권위 데이터다. 빈/부분 denorm을 성공값으로 덮어쓰지 않는다.
7. 채팅 입력창: 리사이즈 핸들은 `top:16px; right:8px`, selector SVG 아이콘, 밈 태그 드래그 스크롤과 우측 페이드가 반영돼 있다.

## 3. 디자인이 “그대로” 보일 수 있는 원인

- V2 플래그 없이 기본 URL을 보고 있음.
- Service Worker/브라우저 캐시가 이전 chunk를 제공함. 캐시 버스트 URL 또는 Clear site data 후 강력 새로고침이 필요하다.
- 현재 구현은 V2 정보구조·카드 골격까지이며, 목업의 색·타이포그래피·간격·반응형 세부 스타일이 아직 완전히 이식되지 않았다.
- Claude artifact는 정적 목업이지 프로덕션 React 코드가 아니다. 목업 HTML을 그대로 복사하지 말고 디자인 토큰과 화면 규칙만 옮긴다.

## 4. 남은 V2 디자인 작업 (우선순위)

### P0 — 실제로 눈에 보이는 홈 패리티

1. Claude 목업과 `calendar/?id=cw&shell=v2`를 나란히 비교해 헤더, 사이드 레일/하단 내비게이션, 홈 카드의 폭·높이·라운드·테두리·그림자·배경색을 맞춘다.
2. 제목/본문/보조문구의 폰트 크기·굵기·행간과 섹션 간격을 디자인 토큰으로 통일한다.
3. 홈 갤러리 썸네일은 데스크톱 6개 스트립, 태블릿·모바일 3열을 유지하되 카드 안쪽 여백과 이미지 비율을 목업과 맞춘다.
4. V2 5탭 목적지(캘린더/대화/기록/정산/더보기)에서 구 셸 UI가 새어 나오지 않는지 확인한다. 기록에는 메모·갤러리·장소·추억·콘텐츠가 모두 포함돼야 한다.

### P1 — 반응형 시각 회귀

375×812, 768×1024, 1024×900, 1440×900에서 스크린샷을 남기고 비교한다. 특히 태블릿은 홈 갤러리 3×3, 모바일은 하단 내비게이션·카드 세로 흐름, 데스크톱은 사이드 레일·2열 카드를 확인한다.

### P2 — 릴리스 결정

시각 패리티 승인 전에는 `shell=v2` 플래그를 제거하거나 V2를 기본 셸로 바꾸지 않는다. 승인 후 별도 유닛에서 기본 전환과 전체 브라우저 회귀를 수행한다.

## 5. 안전한 작업 단위와 검증

각 유닛은 CSS/한 화면 단위로 작게 커밋한다. 사진·댓글·Firestore 스키마를 같은 유닛에서 변경하지 않는다.

```bash
git status --short
npm run lint -- --quiet
npm test
npm run build
npm run check:dist-budget
npm run check:architecture-budget
npm run smoke:live
CALENDAR_SMOKE_BROWSER=chromium npm run smoke:browser
CALENDAR_SMOKE_BROWSER=firefox npm run smoke:browser
CALENDAR_SMOKE_BROWSER=webkit npm run smoke:browser
```

브라우저 스모크는 동일 preview 포트를 쓰는 프로세스를 병렬 실행하지 않는다. 실패 시 먼저 중복 프로세스/러너 간섭인지 단독 재실행으로 구분한다. 코드 변경 후에만 전체 `check:all`과 배포를 수행하고, Pages workflow 성공 및 라이브 URL을 확인한다.

## 6. 절대 지켜야 할 불변조건

- Firebase Storage 파일, 태그, 댓글, `confirmedMeetings.photos`를 정리·삭제·재업로드하지 않는다.
- 확정 일정 저장은 기존 사진 배열을 짧은 배열로 덮어쓰지 않고 서버 merge를 유지한다.
- `photoIndex`는 별도 인덱스·캐시이며 원본 메시지/메모를 대체하지 않는다. 빈/부분 인덱스로 풍부한 태그를 지우지 않는다.
- 사진별 댓글 스레드는 사진별 identity를 사용한다. 동일 메시지의 여러 슬롯을 한 댓글창으로 합치지 않는다.
- `app-main.js`에 큰 조정 로직을 추가하지 않는다. architecture budget(약 12,700줄)과 번들 예산(현재 JS headroom 약 7%)을 지킨다. 새 화면은 지연 로딩을 우선한다.

## 7. 다음 에이전트의 첫 실행 순서

1. 이 문서와 `docs/V2-STATUS.md`, `docs/v2-live-progress.md`, `docs/design-renewal-handoff.md`, `docs/page-feature-contract.md`를 읽는다.
2. 캐시 버스트한 V2 URL을 열어 4개 viewport 스크린샷을 저장한다. Claude artifact는 시각 참고로만 사용한다.
3. P0의 한 항목만 수정하고 위 검증을 통과시킨다.
4. 커밋·`main` push·Pages 배포 확인 후 `docs/v2-live-progress.md`에 KST 시각, 변경 파일, 라이브 확인 결과를 기록한다.
5. 사진/태그/댓글 회귀가 없는지 `cw`, `jhair`, `kkot`의 갤러리·추억·일정 진입만 읽기 전용으로 spot-check한다.

## 8. 알려진 잔여 리스크

- Vite/esbuild 관련 개발 도구 메시지는 운영 번들 기능 오류가 아니다. Vite 8 메이저 변경은 디자인 유닛과 분리한다.
- 인덱스 denorm은 비동기로 늦을 수 있으므로 UI가 원본 fallback을 유지해야 한다.
- 디자인 변경 후 WebKit 단독 스모크를 다시 실행한다. 과거 병렬 실행에서 발생한 timeout은 제품 회귀가 아니라 프로세스 간섭으로 판정된 사례가 있다.
- 현재 이 문서 작성 시점에는 실행 중인 작업이 없다. “진행 중”이라고 표시하려면 실제 커밋/검증 단위를 시작한 뒤 로그를 갱신한다.

관련 문서: `docs/V2-STATUS.md`, `docs/v2-live-progress.md`, `docs/post-v2-quality-roadmap.md`, `docs/design-system.md`, `docs/page-feature-contract.md`.
