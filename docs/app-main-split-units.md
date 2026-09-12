# app-main.js 유닛 카탈로그

상위 계약: [app-main-split-plan.md](./app-main-split-plan.md)  
시작 기준(U0 시점): `origin/main` `0273211` — app-main.js **12,065 / 12,250**.  
**2026-09-12 현재: U0~U9 전부 완료, app-main.js 8,838줄.** 진행 상세는 하단 "로그" 표 참고.
U8과 U10~U14는 여전히 보류/금지 — 이유는 루트 `CLAUDE.md` 및 하단 표 참고.

한 유닛 = 한 PR. 위를 건너뛰지 말 것. CalendarApp (680–8307, 7,628줄)은 U10 이전 동결.

## 레인 잠금

`docs/SPLIT-LANE.lock` (시작 때 작성, 머지 후 삭제)

```
lane: split
unit: U1a
agent: grok
files:
  - src/core/app-main.js
  - src/core/app-ui-wrappers.js
```

| 레인 | 소유 | 금지 |
|---|---|---|
| UI (Claude) | `src/ui/*`, CSS, design-system | `app-main.js`, 신규 `src/core/app-*.js` |
| 분리 (이 플랜) | CalendarApp 밖 `src/core/app-*.js` | `src/ui/*`, CSS |
| 기능 | `functions/`, rules, photo-index | 분리 PR이 열린 동안 `app-main.js` |

UI 레인이 `app-main.js`를 건드리는 중이면 분리 유닛을 시작하지 않는다.

## 공통 계약

허용: CalendarApp 밖 WRAPPER/순수 헬퍼만. 옮긴 이름은 app-main에 import 또는 `const { Name } = ...` 로 남김. `GATHER_UI_DEPS` 키 유지.

금지: CalendarApp 내부 훅/구독. UI와 분리를 한 PR에. Firestore path/limit/photoIndex 변경. 예산 상한만 올리기. hex 패치. `syncIconsFromComponents` 삭제. required-symbols 목록에서 이름 몰래 삭제.

별칭이 CI를 통과하는 이유: `check-required-symbols.mjs`는 `function Name(` / `const Name =` / `includes(Name)` 중 하나면 OK.

게이트: `check:all` + `safety:test` + `build` + dist-budget + `smoke:live` + 수동 5화면(캘린더/채팅+이미지/갤러리 라이트박스/장소 지도/메모 핀) + 태그 `safe-split-Uxx-YYYYMMDD-{sha}` + 사용자 "통과".

오분류: `EditMessageModal`, `ConfirmDialog`, `PollModal`, `MemoView`, `ContentView`, `PlaceRegisterModal`, `UserManualOverlay` 는 4줄 래퍼다. 긴 주석 때문에 REAL처럼 보임. U1 대상.

골드 패턴: `src/core/app-anniversary-dates.js` — export 본체, app-main은 import만.

에이전트 카드:

```
이번 작업은 유닛 Uxx 만.
CalendarApp / App / __gatherStartApp / src/ui / CSS / functions / rules 금지.
목록의 함수만 이동. 같은 이름 별칭 남김. GATHER_UI_DEPS 키 유지.
끝나면 check:all, safety:test, build, dist-budget, 수동, lock 삭제.
다음 유닛은 사용자 통과 후.
```

## 진행 표

| 유닛 | Phase | 대상 | 새 파일 | 회수 | 위험 |
|---|---|---|---|---|---|
| U0 | A | 인벤토리 스크립트 + CalendarApp 7700줄 가드 | `scripts/check-app-main-inventory.mjs` | 0 | 없음 |
| U1a | B | `*Icon` 56개 | `src/core/app-ui-wrappers.js` | ~220 | 낮음 |
| U1b | B | 상단 컴포넌트 래퍼 | 같은 파일 | ~120 | 낮음 |
| U1c | B | 하단 뷰 래퍼 (DateModal/PlacesView 포함) | 같은 파일 | ~250 | 중 (심볼) |
| U2 | C | useTapRevealedMsgId, useModalDirtyGuard, useChatSendGuard | `src/core/app-ui-hooks.js` | ~90 | 낮음 |
| U3 | C | 검색/하이라이트 | `src/core/app-search.js` | ~160 | 낮음 |
| U4 | C | 링크 미리보기 + 캐시 | `src/core/app-link-preview.js` | ~230 | 중 |
| U5 | C | 채팅 렌더 헬퍼 | `src/core/app-chat-render.js` | ~280 | 중 |
| U6 | C | Leaflet/MapLibre 로더 + 마커 HTML | `src/core/app-place-map.js` | ~270 | 중 |
| U7a | C | HEIC/sniff/load | `src/core/app-image-pipeline.js` | ~160 | 중 |
| U7b | C | compress + metadata | 같은 파일 | ~300 | 중 |
| U7c | C | process/chunk/upload/clipboard | 같은 파일 | ~400 | 높음 |
| U7d | C | resolve/delete/migrate + 메모/기념일 업로드 | 같은 파일 | ~260 | 중 |
| U8 | D | bindGatherUiDeps 카탈로그 | `src/core/app-ui-deps.js` | ~280 | 중 |
| U9a–j | D | leftover REAL, 파일당 PR | 아래 표 | ~500 | 중 |
| U10–U14 | E | CalendarApp 훅. 사용자 승인 전 금지 | `src/core/use-*.js` | 큼 | 최고 |

B+C+D 목표: app-main ≈ 8,500–9,200 (CalendarApp 7,628 유지). E 종착 ≈ 4,500–6,000 후 상한 10,000.

## 유닛 카드

### U0 가드
`check-app-main-inventory.mjs`: 최상위 함수 목록, WRAPPER=본문에 GATHER_UI_COMPONENTS 이고 실행줄 ≤8, CalendarApp >7700 실패. `check:all`에 연결. required-symbols 주석: 별칭 허용. 예산 12,250 유지. **app-main 본문 수정 금지** (구역 주석도 UI 레인과 충돌).

### U1a 아이콘
`MenuIcon` … `DicesIcon` (9824–10050). `UnderlineTabs`/`getWeatherIcon` 제외. app-main: `const { MenuIcon, ... } = bindUiComponentAliases(React)`. DEPS 키 유지. 수동: 메뉴/헤더/채팅 아이콘, React #130 없음.

### U1b 상단 래퍼
`ResizableModalContainer` … `CreateSettlementModal`. 건너뛄: tokenizeRichFieldText, renderTextWithUrlBadge, getLiveFirebaseStorage, shouldQueueCalendarWriteFailure, replayQueuedCalendarWrite, getAllDirectMediaImageEntries…buildCultureEventMemoText. UnderlineTabs는 GATHER_APP_UTILS fallback.

### U1c 하단 뷰 래퍼
`CalendarGrid, CommentsSection, MemoCard, PollList, GlobalSearchModal, EditMessageModal, DirectChatMediaText, DeadlineDateTimePicker, PlacesSection, ImageUrlModal, ImageUploadOverlay, ImageProcessingOverlay, EmojiPickerSheet, Lightbox, ChatRoomView, ChatParticipantSheet, AppSettingsModal, NotificationOnboardingModal, NotificationPermissionHelpModal, ConfirmDialog, DateModal, SectionCountBadge, SectionToggleButton, SearchCategoryTabs, SimpleBottomSheetPicker, PhotoGallery, SummaryList, MemoPreviewSection, ShareModal, UserManualOverlay, WeatherBadge, WeatherLocationModal, MainSideMenu, UpdateAvailableBanner, ImageShareViewer, ImageThumbRemoveButton, InlineSearchBar, MemoShareModal, ChatGalleryModal, MemoView, AnniversaryModal, SettlementSummaryModal, PollModal, PlaceMapView, PlacesView, HistoryView, ContentView, PlaceRegisterModal`

required-symbols: AdminLoginGate, PlacesView, DateModal, ChatGalleryModal, PhotoGallery, SummaryList — 별칭 삭제 금지. 수동 필수: DateModal, 장소, 채팅, 갤러리, 메모, 라이트박스. 실패=흰 화면/#130.

### U2 바깥 훅
10347–10432. 이미 CalendarApp 밖. DEPS가 UI에 주입. 수동: 채팅 탭 공개, dirty 이탈, 연속 전송.

### U3 검색
highlightTextWithYellowMarker, highlightKeyword, formatLogTimestamp, computeCalendarSearchMatches, getAdminSearchResultTargetUrl. 호출부 undefined면 검색만 조용히 죽음 (PR #529 하이라이트). 테스트 픽스처 3개.

### U4 링크 미리보기
8347–8575 + PEEKALINK_PROXY_URL/cache/inflight. peekalink 실패가 메시지 저장을 막으면 안 됨 (주석 3312, 4963). 캐시 모듈 스코프 유지.

### U5 채팅 렌더
renderChatMessageBody, parseTextWithLinks, isEmojiOnlyChatText, formatCommentDate, resolveMeetingPhotoDisplay, computeChatImageGridMaxWidth, renderChatMessageImages, buildLightboxImageInfo, getStorageUrlFileSize, getImageExtFromMime. CommentsSection과 ChatRoomView가 같은 함수. 미리보기 파일 버블 빈 칸이면 실패.

### U6 지도
loadLeaflet, loadLeafletMarkerCluster, loadMapLibreLeaflet, getPlaceCategoryMarkerContent, placeMarkerShapeToHtml, buildPlaceMarkerHtml, getMarkerPopupUnionRect, panMapToFitMarkerPopup, centerMapOnMarkerAndPopup, leafletLoadPromise. maplibre **6.9.0** + setWorkerUrl 유지. PlacesView 본체는 ui-places.js.

### U7 이미지 (한 파일, 4 PR)
기존 모듈과 합치지 말고 호출: app-media-upload.js, photo-metadata-tags.js, app-place-search.js. buildMetadataTags는 이미 `return buildPhotoMetadataTags(...)`.

- U7a 8645–8802: loadHeicTo, loadScriptOnce, loadHeic2any, sniffImageFormat, withCorrectedImageFile, isHeicFile, loadImageElement
- U7b 8803–9186: compressImageToDataUrls, extractPhotoMetadata, buildMetadataTags 별칭, buildBase64FallbackFromCompressed, revokeCompressedObjectUrls, preprocess cache. GPS 없어도 #YYMMDD
- U7c 9187–9515, 9619–9658: wakeLock, processImageFilesSequentially, chunkResolvedImagesForMessages, describeImageProcessingFailures, clipboard, appendChatImageFiles, uploadChatImageAssets, dataUrlToBlob, uploadInlineChatImageToStorage. 수동: 채팅/갤러리/일정 사진 + Ctrl+V
- U7d 9516–9823 + 11118–11214: migrate/backfill, resolveImageUrls/Batch, deleteChatImage*, uploadMemoImageAssets, uploadAnniversaryImageAssets, resolveAnniversaryImageBatch

safety 테스트: JPEG 경로, chunk 바이트, GPS 없을 때 날짜태그, describeImageProcessingFailures.

### U8 bindGatherUiDeps
~321줄 Object.assign → 카탈로그. 키 1:1, 삭제는 별도 PR. syncIconsFromComponents / confetti / CONFETTI_Z_INDEX 유지.

### U9 leftover (파일당 PR)
| id | 함수 | 목적지 |
|---|---|---|
| U9a | tokenizeRichFieldText, renderTextWithUrlBadge | app-chat-render 또는 app-rich-text |
| U9b | shouldQueueCalendarWriteFailure, replayQueuedCalendarWrite | app-write-queue.js |
| U9c | getLiveFirebaseStorage, getFirebaseStateVersion, subscribeFirebaseStateChange | firebase-services |
| U9d | isNonChatUploadSource, getMeetingOwnedPhotoMessageIds, isChatRenderableMessage, getAllDirectMediaImageEntries | gallery-data 또는 chat-render |
| U9e | buildCultureEventMemoText, createMemoActivityLog | app-domain-helpers |
| U9f | rebuildCalendarToTimestamp (178) | app-admin-restore.js |
| U9g | twemoji* , getRecentEmojis, addRecentEmoji | app-chat-data |
| U9h | getWeatherIcon, translateKoreanToEnglish | app-weather.js |
| U9i | doesPlaceMatchDate, getShortTitleParts, getAnniversaryDisplayColor | domain-helpers |
| U9j | fetchWithTimeout, KAKAO_CATEGORY_GROUP_TO_PLACE_CATEGORY | app-place-search.js |

### U10–U14 CalendarApp (U9 통과 + 사용자 승인 전 금지)
훅 1개=PR 1개. setState는 deps로 주입. UI 레인 정지.

| 유닛 | 훅 | 위치 | 게이트 |
|---|---|---|---|
| U10 | useChatMessageWindow | 1005–1815 | 구독/hydration/older page. 미리보기가 갤러리 업로드에 안 덮임. `?view=chat&msg=` |
| U11 | useMemoCollections | 2611–2737 | 메모 페이지네이션. gallery에서만 창이 커짐 |
| U12 | useGalleryIndexBindings | 2581–2596, 4499 | 이중 패치. 라이트박스 태그 재오픈 (galleryChatMessages vs chatMessages) |
| U13 | createCalendarPhotoActions(deps) | 3570–6168 | 태그/삭제/점프 |
| U14 | 뷰 JSX | 7330–8307 | 마지막. chat/settlement/memo/gallery/places/history/content |

## 파일 지도 (`0273211`)

```
1–200      import
201–638    상단 래퍼 + REAL 혼재     U1b, U9
639–679    App()                     건드리지 않음
680–8307   CalendarApp 7628줄        U10–U14 전 동결
8308–11718 하단 leftover             U1a/U1c, U2–U7, U9
11719–12039 bindGatherUiDeps         U8
12040–12065 __gatherStartApp         건드리지 않음
```

훅 실측: useState 80, useEffect 45, useRef 31, useCallback 12, useMemo 12.
뷰 JSX: chat 7330, settlement 7396, memo 7431, gallery 7473, places 7536, history 7578, content 7642.

## 이 플랜이 아닌 것
1. Cloud Functions 수동 배포 (kakao coord2address, photoIndex 트리거)
2. UI 디자인 시스템 (UI 레인)
3. 예산 상한 상향

## 로그 (2026-09-12 최신화)

U0~U9(전부)는 완료됐다. U8과 U10~U14는 아래 이유로 보류/금지 상태 그대로다 — 자세한 내용은
루트 `CLAUDE.md` 참고.

| 유닛 | 상태 | PR | 비고 |
|---|---|---|---|
| U0 | 완료 | #539 | 인벤토리 가드 스크립트 |
| U1a | 완료 | #540 → 되돌림(#549, "live site broken") → 재시도 #560 |  |
| U1b | 완료 | 재시도 #561 |  |
| U1c | 완료 | #543 → 재시도 #563 |  |
| U2 | 완료 | #547 → 되돌림(#549) → 재시도 #564 |  |
| U3 | 완료 | 재시도 #567 |  |
| U4 | 완료 | #568 |  |
| U5 | 완료 | #569 |  |
| U6 | 완료 | #570 |  |
| U7a | 완료 | #575 |  |
| U7b | 완료 | #576 |  |
| U7c | 완료 | #579 |  |
| U7d | 완료 | #582 |  |
| U8 | **보류** | | `bindGatherUiDeps`가 파일 전체 로컬 스코프에 의존 — 단순 이동 불가 |
| U9a | 완료 | #583 |  |
| U9b | 완료 | #592 | 처음 라운드에서 누락됐다가 나중에 발견해서 처리 |
| U9c | 완료 | #584 |  |
| U9d | 완료 | #585 |  |
| U9e | 완료 | #586 |  |
| U9f | 완료 | #587 |  |
| U9g | 완료 | #588 |  |
| U9h | 완료 | #589 |  |
| U9i | 완료 | #590 |  |
| U9j | 완료 | #591 |  |
| U10–U14 | **금지** | | CalendarApp 핵심 훅 — 유닛별 사용자 명시 승인 전 시작 금지 |

`app-main.js`: 12,065줄(U0 기준) → 8,838줄. 최상위 REAL(비-CalendarApp) 선언 30개 → 15개.
