# app-main.js 분할 플랜 (canonical)

작성: 2026-09-11 (유닛 카탈로그 추가)  
기준: `src/core/app-main.js` @ `0273211` — **12,065 / 12,250줄** (여유 185줄)  
상태: 문서만. 코드 변경 없음.

**실행 유닛(U0–U14, 한 유닛=한 PR)은 [app-main-split-units.md](./app-main-split-units.md) 가 우선한다.** 이 파일은 계약/배경. 책터 N 약 유닛 U 매핑은 units 문서를 따른다.

정정: `ConfirmDialog` / `EditMessageModal` / `PollModal` / `MemoView` / `ContentView` / `UserManualOverlay` / `PlaceRegisterModal` 는 4줄 래퍼다 (긴 주석 때문에 REAL처럼 보였음). U1 대상.

**CalendarApp (680–8307, 7,628줄) 은 U10 이전 동결.** UI 레인이 `app-main.js`를 건드리는 중이면 분리 유닛을 시작하지 말 것.

이 파일이 이후 app-main 분리의 계약 소스다. 아래 문서는 역사 기록이며 따르지 말 것.

- ~~[docs/split-plan.md](./split-plan.md)~~ — Vite 이전 (`assets/`, 인라인 `index.html`)
- ~~[docs/p6-2-plan.md](./p6-2-plan.md)~~, ~~[docs/p6-2-app-main-map.md](./p6-2-app-main-map.md)~~ — 복사만 하고 원본을 남긴 P6-2
- 참조: [docs/module-map.md](./module-map.md)
- **실행 유닛:** [docs/app-main-split-units.md](./app-main-split-units.md)

---

## 1. 왜 다시 써야 하는가

지금까지 분리는 “예산 상한에 닫려서 급하게 조각 빼는” 식이었다. `CalendarApp` 클로저를 자르면 라이브가 깨진다.

| 원인 | 실제 증상 |
|---|---|
| 이중 원본 | UI는 `src/ui/*.js` → `window.GATHER_UI_COMPONENTS`. app-main 하단에도 같은 이름. 에이전트가 죽은 쪽을 고침 |
| 심볼 삭제 | `getPlaceSortDateKey`를 별칭 없이 제거 → 장소 탭 크래시 (split-plan 15c) |
| `GATHER_UI_DEPS` 누락 | 아이콘 없으면 React #130 |
| `createRoot` 두 번 | React #300 (main.jsx + `__gatherStartApp`) |
| CalendarApp 통째 추출 | `useState` 80 + `useEffect` 45가 한 클로저. 구독 의존성 하나 빠지면 채팅/갤러리 리셋 |
| 예산 압박 | 여유 185줄. 기능 PR이 분리를 강제하고, 분리가 다시 기능을 깨뜨림 |
| hex 패치 | 대형 파일을 기계적으로 잘라 컨텍스트 소실 |
| 레인 충돌 | UI 에이전트와 분리 에이전트가 `app-main.js`를 동시 편집 |

**해결:** `CalendarApp`은 U10 이전 동결. 그 **밖**의 WRAPPER / 순수 헬퍼만, 한 유닛 = 한 PR. 잠금 파일 `docs/SPLIT-LANE.lock`.

상세 유닛 카드·함수 목록·수동 게이트는 **[app-main-split-units.md](./app-main-split-units.md)**.
