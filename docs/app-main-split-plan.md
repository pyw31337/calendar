# app-main.js 분할 플랜 (canonical)

작성: 2026-09-11  
기준: `src/core/app-main.js` @ `ab0b964` — **12,083 / 12,250줄** (여유 167줄)  
상태: 문서만. 코드 변경 없음. 책터 0부터는 사용자가 “통과”라고 한 뒤에만 진행.

**이 파일이 이후 app-main 분리의 유일 소스다.** 아래 문서는 역사 기록이며 따르지 말 것.

- ~~[docs/split-plan.md](./split-plan.md)~~ — Vite 이전 (`assets/`, 인라인 `index.html`)
- ~~[docs/p6-2-plan.md](./p6-2-plan.md)~~, ~~[docs/p6-2-app-main-map.md](./p6-2-app-main-map.md)~~ — 복사만 하고 원본을 남긴 P6-2
- 참조: [docs/module-map.md](./module-map.md)

---

## 1. 왜 다시 써야 하는가

지금까지 분리는 “예산 상한에 닫려서 급하게 조각 뼈는” 식이었다. `CalendarApp` 클로저를 자르면 라이브가 깨진다.

| 원인 | 실제 증상 |
|---|---|
| 이중 원본 | UI는 `src/ui/*.js` → `window.GATHER_UI_COMPONENTS`. app-main 하단에도 같은 이름. 에이전트가 죽은 쪽을 고침 |
| 심볼 삭제 | `getPlaceSortDateKey`를 별칭 없이 제거 → 장소 탭 크래시 (split-plan 15c) |
| `GATHER_UI_DEPS` 누락 | 아이콘 없으면 React #130 |
| `createRoot` 두 번 | React #300 (main.jsx + `__gatherStartApp`) |
| CalendarApp 통째 추출 | `useState` 80 + `useEffect` 45가 한 클로저. 구독 의존성 하나 빠지면 채팅/갤러리 리셋 |
| 예산 압박 | 여유 167줄. 기능 PR이 분리를 강제하고, 분리가 다시 기능을 깨뜨림 |
| hex 패치 | 대형 파일을 기계적으로 잘라 컨텍스트 소실 |

**해결:** `CalendarApp`은 책터 8 이전 동결. 그 **밖**의 WRAPPER / 순수 헬퍼만, 한 책터 = 한 PR.

---

## 2. 현재 파일 지도 (`ab0b964` 기준, 줄 번호는 이 커밋 기준)

```
1–200        import / 도메인 배선
201–638      UI 래퍼 (GATHER_UI_COMPONENTS 전달)     ~438줄   ← 책터 1
639–679      App() 셸
680–8307     CalendarApp  ★동결★                     7,628줄
8308–11735   하단 leftover (래퍼 + REAL 헬퍼 혼재)  3,428줄   ← 책터 2–6
11736–12083  bindGatherUiDeps + 부트                 ~348줄   ← 책터 7
```

`CalendarApp` 안: 채팅/갤러리/메모 구독, 사진 패치, DateModal/Lightbox 호스트, 뷰 분기(`chat|memo|gallery|places|history|content|settlement`). **책터 8 이전 금지.**

하단 leftover 분류:

- **WRAPPER** — 아이콘 ~80개 + `CalendarGrid` / `DateModal` / `PlacesView` / `ChatRoomView` 등. 4~8줄, `GATHER_UI_COMPONENTS`만 호출.
- **REAL** — 이미지 파이프라인, 링크 미리보기, 지도 로더, 검색, 업로드. 동작 헬퍼. 본체는 여기, UI 본체는 `src/ui/`.

래퍼가 **아닌** 예외 (책터 1에서 빼지 말 것): `ConfirmDialog`, `EditMessageModal`, `PollModal`, `MemoView`, `ContentView`, `UserManualOverlay`.

---

## 3. 전 책터 공통 규칙

### 허용

- `CalendarApp` **밖**의 WRAPPER 또는 이미 증명된 순수 헬퍼만 이동
- 이동 후 app-main에 **같은 이름 별칭** 유지 (`const foo = imported.foo` 또는 destructure)
- `scripts/check-required-symbols.mjs`가 app-main 문자열에서 이름을 찾으므로, 별칭을 지우면 CI와 런타임이 같이 죽음
- `window.GATHER_UI_DEPS`에 넣던 키는 유지 (값은 import한 함수를 가리키면 됨)
- 한 PR에 함수 5~10개, 또는 파이프라인 하나

### 금지

- `CalendarApp` 내부 `useEffect` / `useState` / 구독 의존성 배열 이동
- `src/ui/*` 와 app-main을 한 PR에서 같이 수정
- Firestore path / 구독 limit / photoIndex 규칙 변경
- 예산 상한(12,250)만 올리고 분리를 무시
- hex 패치로 대형 파일 기계적 절단
- 분리와 UI 폴리시를 같은 커밋에 섮음
- 기능 추가와 분리를 같은 PR에 섮음

### 책터 종료 게이트 (하나라도 실패하면 다음 책터 금지)

1. `npm run check:all`
2. `npm run safety:test`
3. `npm run build` + dist-budget
4. Pages 배포 후 `npm run smoke:live`
5. 수동 5화면: 캘린더 / 채팅 전송+이미지 / 갤러리 라이트박스 태그 / 장소 지도 / 메모 핀
6. 태그: `safe-split-chN-YYYYMMDD-<sha>`
7. **24시간 소크** 또는 사용자 “책터 N 통과” 확인 후에만 다음 책터

### 병렬 작업 레인

분리 책터 진행 중 다른 에이전트는 **`src/ui/*`와 CSS만**. app-main 동시 편집 금지. 반대로, 기능/UI 작업 중에는 분리 책터를 시작하지 말 것.

### 에이전트에게 주는 한 장

```
이번 작업은 책터 N만 한다.
- CalendarApp (function CalendarApp, ~680–8307) 내부는 한 줄도 바꾸지 않는다.
- src/ui/* 와 CSS는 건드리지 않는다.
- 옮긴 함수는 app-main에 동일 이름 별칭을 남긴다.
- GATHER_UI_DEPS 키를 삭제하지 않는다.
- 끝나면 check:all, safety:test, build, live-smoke, 태그.
- 다음 책터는 사용자가 “책터 N 통과”라고 한 뒤에만.
```

---

## 4. 책터

진행 표 (체크 할 것):

| 책터 | 상태 | 내용 | 예상 회수 |
|---|---|---|---|
| 0 | 미시작 | 가드레일 스크립트 + 인벤토리 | 0 (감시만) |
| 1 | 미시작 | 래퍼 테이블화 | 350~500 |
| 2 | 미시작 | 이미지 파이프라인 | 900~1,100 |
| 3 | 미시작 | 링크 미리보기 | ~230 |
| 4 | 미시작 | 채팅 렌더 헬퍼 | ~250 |
| 5 | 미시작 | 장소 지도 로더 | ~250 |
| 6 | 미시작 | 검색/하이라이트 | ~150 |
| 7 | 미시작 | `bindGatherUiDeps` 데이터화 | ~300 |
| 8–12 | 금지 | CalendarApp 훅 (사용자 승인 후) | 훅 1개=PR 1개 |

책터 7 종료 목표: **app-main ≈ 8,500–9,000줄**, CalendarApp 7,628줄은 그대로. 예산 여유 3,000줄+.

---

### 책터 0 — 가드레일만 (코드 이동 없음)

목적: 다음 에이전트가 파일만 보고 안전 구역을 알게.

1. 이 문서가 canonical (완료).
2. `scripts/check-app-main-inventory.mjs` 추가
   - 최상위 `function` 목록 + 줄 수
   - WRAPPER vs REAL 분류
   - `CalendarApp` 줄 수가 **7,700을 넘으면 실패** (안으로 코드가 다시 흡입되는 것 방지)
3. `check-required-symbols` 주석: 별칭은 허용, 본체 삭제는 목록 갱신 후에만
4. 아키텍처 예산은 **12,250 유지**. 여유는 상한 상향이 아니라 하단 추출로 만든다.

완료 조건: 인벤토리 스크립트가 CI에 들어가고, app-main 줄 수 변화 없음.

---

### 책터 1 — 래퍼 테이블화 (저위험)

대상: `ResizableModalContainer` ~ `CreateSettlementModal`, 하단 `*Icon` ~80개.

신규: `src/core/app-ui-wrappers.js`

```js
export function bindUiComponentAliases(React) {
  const names = ['CalendarGrid', 'DateModal', 'ChatRoomView' /* … */];
  const out = {};
  for (const name of names) {
    out[name] = function Wrapper(props) {
      const C = window.GATHER_UI_COMPONENTS?.[name];
      return typeof C === 'function' ? React.createElement(C, props) : null;
    };
  }
  return out;
}
```

app-main은 `const { DateModal, ChatRoomView, ... } = bindUiComponentAliases(React);`만 남긴다.

주의:

- `UnderlineTabs`처럼 `GATHER_UI_COMPONENTS` 다음 `GATHER_APP_UTILS` fallback이 있는 예외는 테이블에 `fallback` 필드로 명시
- 위 예외 목록(`ConfirmDialog` 등)은 이 책터에서 빼지 말 것
- destructure 이름을 기존과 1:1로. 바뀌면 CalendarApp JSX가 깨짐

수동 확인: 메뉴·채팅 액션 아이콘 (React #130 없음), DateModal/장소/채팅 화면 동일.

---

### 책터 2 — 이미지 파이프라인 (가장 큰 REAL 블록)

대상 (대략 8645–9811): `loadHeicTo`, `loadHeic2any`, `sniffImageFormat`, `compressImageToDataUrls`, `extractPhotoMetadata`, `processImageFilesSequentially`, `chunkResolvedImagesForMessages`, `uploadChatImageAssets`, `getImageFilesFromClipboardEvent`, wake-lock, preprocess cache.

신규: `src/core/app-image-pipeline.js`

기존 모듈과 **합치지 말고** 호출만 한다.

- `app-media-upload.js` — watchdog / concurrency
- `photo-metadata-tags.js` — 태그 문자열

`scripts/firebase-safety-tests.mjs`에 넣을 것:

- HEIC가 아닌 JPEG 경로
- `chunkResolvedImagesForMessages` 바이트 예산
- `extractPhotoMetadata` GPS 없을 때 날짜태그만
- `describeImageProcessingFailures`

수동: 채팅/갤러리/일정 사진 업로드 각 1회. 썸네일+원본 URL. `#YYMMDD` 날짜태그 유지.

---

### 책터 3 — 링크 미리보기

대상: `cacheLinkPreview` ~ `extractDirectImageUrls`, `useLinkPreview`.

신규: `src/core/app-link-preview.js`

계약: peekalink 실패는 메시지 저장을 막으면 안 됨 (CalendarApp 주석 3312, 4963). 추출 시 테스트로 고정.

---

### 책터 4 — 채팅 렌더 헬퍼

대상: `renderChatMessageBody`, `renderChatMessageImages`, `resolveMeetingPhotoDisplay`, `computeChatImageGridMaxWidth`, `isEmojiOnlyChatText`, `parseTextWithLinks`.

신규: `src/core/app-chat-render.js`

계약: `CommentsSection`(메인 미리보기)와 `ChatRoomView`가 같은 함수를 쓰는다. 미리보기 파일 버블이 빈 칸이 되면 실패 (`src/main.jsx`가 `ui-chat-files.js`를 eager load하는 이유).

---

### 책터 5 — 장소 지도 로더

대상: `loadLeaflet`, `loadLeafletMarkerCluster`, `loadMapLibreLeaflet`, `buildPlaceMarkerHtml`, `panMapToFitMarkerPopup`, `centerMapOnMarkerAndPopup`.

신규: `src/core/app-place-map.js`

계약:

- maplibre **6.9.0** + `setWorkerUrl` 유지 (CVE-2026-85061 패치 회귀)
- `PlacesView` 본체는 `src/ui/ui-places.js`. app-main 쪽은 래퍼
- 장소 탭 핀/클러스터/팝업 수동 필수

---

### 책터 6 — 검색 / 하이라이트

대상: `highlightKeyword`, `computeCalendarSearchMatches`, `getAdminSearchResultTargetUrl`, `formatLogTimestamp`.

신규: `src/core/app-search.js`

계약: 장소·보관함 지난모임 하이라이트는 PR #529에서 들어갔다. 추출 후 호출부가 `undefined`가 되면 검색만 조용히 죽는다.

---

### 책터 7 — `bindGatherUiDeps` 데이터화

`bindGatherUiDeps`는 ~300줄 `Object.assign`. 로직이 아니라 **카탈로그**.

신규: `src/core/app-ui-deps.js`

- `DEPS_FROM_LOCAL = ['processImageFilesSequentially', …]`
- `DEPS_FROM_COMPONENTS = ['DateModal', …]`

규칙: 키는 유지, 함수가 있을 때만 할당. 아이콘 sync IIFE (`syncIconsFromComponents`) **삭제 금지** — React #130 가드.

---

### 책터 8–12 — CalendarApp 내부 (여기부터 위험. 책터 7 통과 + 사용자 승인 전 금지)

CalendarApp을 뷰 컴포넌트로 조개서 쌔개지 말 것. 먼저 **커스텀 훅 1개 = PR 1개**.

| 책터 | 훅 | 대략 위치 | 이유 |
|---|---|---|---|
| 8 | `useChatMessageWindow` | 1620–3080 | 라이브 구독 + hydration + older page. 의존성 배열이 가장 예민 |
| 9 | `useMemoCollections` | 2610–2720 | pinned/recent/activity 3구독 머지 |
| 10 | `useGalleryIndexBindings` | photo-index / gallery-archive glue | 이중 패치(주석 3046) 유지 |
| 11 | `createCalendarPhotoActions(deps)` | 3570–6168 | Lightbox 태그/삭제/점프. setState를 deps로 주입 |
| 12 | 뷰 분기 JSX | 7330–8307 | **마지막**. 훅이 안정된 뒤에만 |

책터 8 추가 게이트:

- 메인 미리보기 위젯이 갤러리 업로드에 안 덮임 (주석 1633)
- `?view=chat&msg=` 딥링크
- 라이트박스 태그 저장 후 재오픈 (`galleryChatMessages` vs `chatMessages` — PR #529에서 한 번 깨짐)

종착 목표: `app-main.js` ≈ 4,500–6,000줄 = `App` + `CalendarApp` 상태/뷰 스위치 + 앨은 액션 주입. 그때 예산 상한을 **10,000으로 낮춰** 재흡입을 막는다.

---

## 5. 완료 후 아키텍처

```
app-main.js                 coordinator (상태, 구독, 뷰 스위치)
app-ui-wrappers.js          GATHER_UI_COMPONENTS 별칭
app-ui-deps.js              bindGatherUiDeps 카탈로그
app-image-pipeline.js       HEIC/압축/메타데이터/업로드
app-link-preview.js
app-chat-render.js
app-place-map.js            Leaflet/MapLibre 로더 + 마커 HTML
app-search.js
(+ 기존 app-anniversary-dates, photo-metadata-tags, gallery-*, firebase-services 등)
```

`src/ui/*.js`는 계속 뷰 본체. 분리 책터가 UI 파일을 건드리지 않는다.

---

## 6. 수동 검수 체크리스트 (매 책터 공통)

- [ ] 메인 캘린더: 월 이동, 날짜 선택, DateModal 열기/닫기
- [ ] 캘린더 격리: `kkot` / `cw` / `jhair`
- [ ] 채팅: 텍스트 전송, 이미지 업로드, URL 미리보기, 파일 첨부
- [ ] 갤러리: 라이트박스 태그 저장 후 재오픈, 댓글 뱃지
- [ ] 장소: 지도 핀/클러스터/팝업, 검색
- [ ] 메모: 핀, 검색 하이라이트
- [ ] 정산: 정산 기능이 켜 있는 캘린더만
- [ ] 관리자: 로그인 게이트, 탭 하나
- [ ] 폭: 390 / 768 / 1440

---

## 7. 진행 로그

책터를 끝낼 때마다 아래를 갱신한다.

| 책터 | PR / SHA | 태그 | 회수 (before → after) | 통과일 |
|---|---|---|---|---|
| 0 | | | 12083 → | |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
