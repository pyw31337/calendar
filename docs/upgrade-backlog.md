# 모여라 캘린더 — 업그레이드 백로그 (실행 계획)

> 목표: 라이브 무중단, 유닛 단위 배포, 배포 후 스모크 확인
> 기준일: 2026-08-19
> 안정 커밋 참고: places sortkey 복구 커밋

## 0. 운영 규칙 (모든 유닛 공통)

1. 한 유닛 = 하나의 커밋 주제
2. 변경 후: node --check, assets/public 미러, index.html ?v=, push 후 Pages 대기
3. 스모크: /?id=cw , chat, memo, **places**, /?id=kkot , /?admin=1
4. 유틸 분리 시 함수 삭제 금지 — main은 별칭+fallback, 중간 헬퍼 grep 검증
5. Firestore 스키마 변경은 리팩터와 분리

## 1. 완료 (2026-08-19)

- 채팅/메모/장소 구독·한도·슬림화, app-config 정렬
- 정산 confirm 1회, 클라이언트 admin 해시 제거
- 다크모드/글자/알림 캘린더별, 어드민 라이트 고정
- utils 15a/15b/15c + getPlaceSortDateKey 복구

## 2. 남은 작업 우선순위

### P0 안전망
- P0-1 필수 심볼 검사 (check:required-symbols) ✅ 2026-08-20 (gallery/summary symbols)
- P0-2 smoke:live places/memo/gallery 포함 ✅ 2026-08-20
- P0-3 safe 태그 ✅ 문서화 2026-08-20 (docs/ops-runbook.md)

### P1 utils 15 마무리
- P1-1 방문 메모 파싱 → utils ✅ 2026-08-20
- P1-2 trimLatLngOutliers → utils ✅ 2026-08-20
- P1-3 공유 경로 파서 → utils ✅ 2026-08-20
- P1-4 getActiveParticipants 등 소형 pure ✅ 2026-08-20

### P2 성능
- P2-1 백그라운드 탭 부담 완화 ✅ 2026-08-20 (15s hidden → disableNetwork)
- P2-2 이미지 파이프라인/egress ✅ 2026-08-20 (gallery count cache 5m, smaller scan, decoding=async)
- P2-3 어드민 첫 로딩 ✅ 2026-08-20
- P2-4 메인 맵 지연 마운트 ✅ 2026-08-20 (IntersectionObserver + idle fallback)

### P3 Firebase 서비스 계층
- P3-1 firebase-services.js 스캐폴드 ✅ 2026-08-20 (window.GATHER_FIREBASE_SERVICES)
- P3-2 REST 헬퍼 이동 ✅ 2026-08-20 (count/older/recent/gallery → firebase-services)
- P3-3 구독 래퍼 ✅ 2026-08-20 (messages/places/memos/anniversaries)
- P3-4 kkot/cw/jhair 격리 확인 ✅ 2026-08-20 (check:isolation + calId guards)

### P4 UI 분리
- ConfirmDialog ✅ 2026-08-20 (assets/ui-confirm-dialog.js)
- ShareModal ✅ 2026-08-20 (assets/ui-share-modal.js)
- Lightbox ✅ 2026-08-20 (assets/ui-lightbox.js)
- SideMenu ✅ 2026-08-20 (assets/ui-side-menu.js)
- Overlays/Emoji ✅ 2026-08-20 (assets/ui-overlays.js)
- UserManualOverlay ✅ 2026-08-20 (assets/ui-user-manual.js)
- ChatParticipantSheet + NotificationHelp ✅ 2026-08-20 (assets/ui-chat-sheets.js)
- WeatherBadge + WeatherLocationModal ✅ 2026-08-20 (assets/ui-weather.js)
- PlacesView + PlaceMapView ✅ 2026-08-20 (assets/ui-places.js)
- Misc chat/share UI ✅ 2026-08-20 (assets/ui-misc.js)
- Summary/Gallery/tabs ✅ 2026-08-20 (assets/ui-summary-gallery.js)
- PlaceRegisterModal ✅ 2026-08-20 (assets/ui-place-register.js)
- ChatGalleryModal ✅ 2026-08-20 (assets/ui-chat-gallery.js)
- DateModal ✅ 2026-08-20 (assets/ui-date-modal.js)
- MemoView ✅ 2026-08-20 (assets/ui-memo-view.js)
- ChatRoomView ✅ 2026-08-20 (assets/ui-chat-room.js)
- AdminDashboard ✅ 2026-08-20 (assets/ui-admin-dashboard.js)
- Anniversary/Settlement/Poll modals ✅ 2026-08-20 (assets/ui-event-modals.js)
- CalendarGrid/Comments/MemoCard/Poll/Search ✅ 2026-08-20 (assets/ui-calendar-core.js)
- Admin sub-modals ✅ 2026-08-20 (assets/ui-admin-modals.js)
- Remaining media/deadline/places section ✅ 2026-08-20 (assets/ui-remaining.js)
- Shared primitives (ResizableModal, form buttons, charts) ✅ 2026-08-20 (assets/ui-shared.js)

### P5 UX 잔여
- P5-1 공유 URL/OG ✅ 2026-08-20 (ShareModal 뷰 타이틀, settlement OG, check:share-urls)
- P5-2 모바일 체크리스트 ✅ 2026-08-20 (docs/mobile-checklist.md)
- P5-3 디자인 규칙 누락 점검 ✅ 2026-08-20 (docs/design-rules.md + check:design-rules)

### 최근 버그픽스 (2026-08-20)
- 장소: 지도 마커 → 리스트 포커스, 맵 선택 시 지도 점프 방지
- 갤러리: 페이지에서 Lightbox 렌더
- 채팅: 입력 초안 있을 때 스크롤해도 composer 유지

- Icons ✅ 2026-08-20 (assets/ui-icons.js)
- Leftover widgets ✅ 2026-08-20 (assets/ui-widgets.js)
- **P4 complete except App shell** ✅ 2026-08-20
- Size budget tracks assets/app-main.js ✅ 2026-08-20

- Module map + ops runbook refresh ✅ 2026-08-20 (docs/module-map.md)

### P6 Vite (별도 일정)
- P6-0 준비 ✅ 2026-08-20 (docs/vite-migration.md) — Vite src/ 전환은 기능 동결 후 별도 스프린트

### P7 운영 문서·예산 알림·E2E Action
- P7-1 운영 런북 ✅ 2026-08-20 (docs/ops-runbook.md)
- P7-2 Verify CI 강화 ✅ 2026-08-20 (check:all + size-budget)
- P7-3 Live smoke Action ✅ 2026-08-20 (main push + daily)

## 3. 권장 순서
P0 → P1 → P2-3 → P2-2 → P3 → P4 → P5 → (P6 일정 후)

## 4. 금지
- utils로 잘라내며 중간 함수 삭제
- 전역 테마/폰트 키 재도입
- 캘린더 데이터 혼용
- Vite와 기능 수정을 한 커밋에 섞기
