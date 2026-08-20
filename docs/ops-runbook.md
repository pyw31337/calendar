# 운영 런북 (P7)

최종 갱신: 2026-08-20 (P4 UI 분리 완료)

## 1. 배포
1. 로컬 검증: npm run predeploy   # check:all(size-budget·tab-wiring 포함) + safety
2. main push → GitHub Pages + Verify Calendar
3. 배포 후: npm run smoke:live

## 2. 안전 태그
git tag safe-20260820-p4-complete && git push origin safe-20260820-p4-complete

## 3. 모듈 지도 (P4 이후)

### UI (assets/ui-*.js)
- ui-admin-dashboard.js
- ui-admin-modals.js
- ui-calendar-core.js
- ui-chat-gallery.js
- ui-chat-room.js
- ui-chat-sheets.js
- ui-confirm-dialog.js
- ui-date-modal.js
- ui-event-modals.js
- ui-icons.js
- ui-lightbox.js
- ui-memo-view.js
- ui-misc.js
- ui-overlays.js
- ui-place-register.js
- ui-places.js
- ui-remaining.js
- ui-share-modal.js
- ui-shared.js
- ui-side-menu.js
- ui-summary-gallery.js
- ui-user-manual.js
- ui-weather.js
- ui-widgets.js

### 코어 / 서비스
- app-calendar-data.js
- app-chat-data.js
- app-config.js
- app-constants.js
- app-main.js
- app-notifications.js
- app-utils.js
- firebase-services.js

### 잔여 모놀리스
- app-main.js — App 본체(상태·라우팅·Firestore 구독)만 큼. 추가 UI 컴포넌트 분리 완료.

## 4. 배포 전 스모크 (수동)
1. 메인: 캘린더, 사이드메뉴, 일정 팝업
2. 채팅: 메시지, 갤러리, composer, 사이드메뉴 구분선
3. 메모 / 장소 / 갤러리
4. 공유 URL (/share/... )
5. 어드민 로그인·탭

## 5. Google Cloud 예산 알림
console.cloud.google.com → 결제 → 예산 및 알림 (월 5~10달러 권장, 50/90/100%)

## 6. CI
- Verify Calendar: safety + check:all + size-budget
- Live smoke: main push + daily

## 7. 다음 큰 단계 (P6 Vite)
- 기능 동결 스프린트에서만 진행 (docs/vite-migration.md)
