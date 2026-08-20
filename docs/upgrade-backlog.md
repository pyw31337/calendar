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
- P0-3 safe 태그 — 배포 후 `git tag safe-20260820-p0 && git push origin safe-20260820-p0`

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
- P3-3 구독 래퍼
- P3-4 kkot/cw/jhair 격리 확인

### P4 UI 분리
- ConfirmDialog, ShareModal, SideMenu, Lightbox

### P5 UX 잔여
- 공유 URL/OG, 디자인 규칙 누락, 모바일 체크리스트

### P6 Vite (별도 일정)
### P7 운영 문서·예산 알림·E2E Action

## 3. 권장 순서
P0 → P1 → P2-3 → P2-2 → P3 → P4 → P5 → (P6 일정 후)

## 4. 금지
- utils로 잘라내며 중간 함수 삭제
- 전역 테마/폰트 키 재도입
- 캘린더 데이터 혼용
- Vite와 기능 수정을 한 커밋에 섞기
