# 낙관적 UI(Optimistic UI) 전수조사 + 라이트박스 업그레이드 기획안

이 문서는 2026-09-21 세션에서 라이트박스 태그/댓글 저장에 낙관적 UI를 적용한 뒤,
"같은 패턴을 앱 전체에 적용할 수 있는 곳이 더 있는지, 체감 속도/기능 면에서 더
업그레이드할 곳이 있는지" 조사한 결과와 제안을 정리한다. 실행은 각 항목마다
별도 승인 후 진행한다 — 특히 채팅/메모/갤러리는 `CLAUDE.md`가 명시적으로
"핵심 훅, 명시적 승인 없이 시작하지 않는다"고 못박은 영역과 겹친다.

## 조사 방법

`app-main.js`/`ui-memo-view.js`의 `handle*` 뮤테이션 핸들러(추가/저장/삭제/수정)를
훑어, 각각이 "서버 확인 → 화면 반영"(비관적)인지 "화면 먼저 반영 → 서버 확인,
실패 시 롤백"(낙관적)인지 분류했다. 앱 전체를 한 줄씩 다 읽은 전수조사는 아니고,
사용 빈도가 높은 대표 경로(참석/가용성, 정산, 채팅 전송/삭제/수정, 메모 작성/삭제,
라이트박스 태그/댓글)를 표본으로 확인했다.

## 핵심 발견: 이미 낙관적인 부분이 예상보다 훨씬 많다

`updateCalendars`(`app-main.js:513`)가 캘린더 문서 하나에 담기는 모든 데이터
(참석/가용성, 정산 비용, 모임 확정, 투표 등)의 공용 저장 경로인데, 이 함수 자체가
이미 낙관적으로 짜여 있다:

```js
previousCalendars = calendars;
setCalendarsState(normalizedCalendars);   // 서버 응답 전에 먼저 반영
// ... 이후 실제 Firestore 쓰기, 실패 시 previousCalendars로 롤백
```

그래서 아래 기능들은 **이미** 낙관적 UI다 (추가 작업 불필요):

| 기능 | 핸들러 | 비고 |
|---|---|---|
| 참석/가용성 삭제 | `handleDeleteAvailability` | 되돌리기 토스트까지 있음 |
| 정산 비용 저장/삭제 | `handleSaveExpense`/`handleDeleteExpense` | `updateCalendars` 경유 |
| 채팅 메시지 전송 | `handleSendChatMessage` | `sentMessagesForOptimisticInsert`로 명시적 낙관 삽입 |
| 메모 삭제 | `handleDeleteMemo` (`ui-memo-view.js`) | 되돌리기 토스트까지 있음 |
| 사진 댓글 삭제 | `CommentThread.handleDeleteComment` (`ui-lightbox.js`) | 이번 세션 이전부터 이미 적용돼 있었음 |
| 라이트박스 태그 저장/삭제 | `LightboxTagPanel` | **이번 세션에 추가** (PR #711) |
| 사진 댓글 등록/수정 | `CommentThread.handleSaveComment` | **이번 세션에 추가** (PR #711) |

이건 반가운 결과다: "라이트박스만 특별히 느슨하게 짜여 있었다"가 아니라, 앱의
핵심 저장 경로는 대부분 설계 단계부터 낙관적이었고, **별도 컬렉션(messages,
memos, photoComments)을 쓰는 몇몇 기능만 그 패턴에서 빠져 있었다.** 이번
세션에서 그 빠진 부분(태그/댓글)을 정확히 찾아 메웠다.

## 남은 격차 — 처리 결과 (2026-09-21 후속 세션)

### 1. 채팅 메시지 삭제 — `handleConfirmDeleteMessage` (app-main.js) — ✅ 적용 완료
서버 삭제가 끝난 뒤에야 `removeLocalChatMessage(id)`를 호출하던 것을,
삭제 요청 즉시 로컬에서 제거하도록 바꿨다. 기존에 있던 되돌리기 로직
(`restoreMessage`)을 그대로 재사용해, 실패 시(예외 포함) 원래 메시지를
복원한다 — 되돌리기 토스트의 "되돌리기" 액션과 실패 롤백이 같은 함수를 쓴다.

### 2. 채팅 메시지 수정 — `handleSaveEditMessage` (app-main.js) — ✅ 적용 완료
텍스트만 고치고 새 이미지/파일 업로드가 없는 경우(`isTextOnlyEdit`)만 분리해
서버 쓰기 전에 즉시 로컬에 반영하도록 했다. 이미지가 섞인 수정(업로드가
필요한 경우)은 기존 방식(업로드 완료 후 반영)을 그대로 유지한다 — 업로드
자체가 지연의 대부분을 차지해 낙관화의 이득이 작고, 청크 분할/Storage 정리
로직까지 낙관화하면 위험만 커지기 때문. 실패 시(또는 예외 발생 시) 편집 전
값으로 롤백한다.

### 3. 새 메모 작성 — `handleSaveMemo` (ui-memo-view.js) — 조사 결과 정정: 이미 낙관적이었음
처음 조사에서는 "사진 유무와 무관하게 서버 응답을 기다린다"고 판단했으나,
후속 확인 결과 이는 오진단이었다. `handleSaveMemo`는 `onUpsertMemo(memoData)`를
실제 Firestore 쓰기(`await writeMemoDocument`) **이전에** 호출하고 있어, 새
메모 카드는 사진 유무와 무관하게 이미 즉시 목록에 나타난다. 저장 실패 시
`onDeleteMemo(memoId)`로 롤백하는 것도 이미 구현돼 있다. 코드 변경 없음.

### 4. (조사하지 못함) 장소(Places) CRUD, 투표(Poll) 응답
시간 관계상 표본에서 제외했다. `handleDeletePlace` 등은 `updateCalendars`를
쓸 가능성이 높아(캘린더 문서 소속 데이터) 이미 낙관적일 개연성이 크지만,
확정 조사는 아니다.

## 라이트박스 자체에 대한 결론 (레퍼런스 조사 결과)

PhotoSwipe(업계 표준, 25k+ GitHub stars), yet-another-react-lightbox, Google
Photos UX 가이드라인을 조사한 결과, 우리 라이트박스(`ui-lightbox.js`)는 이미
PC 줌/팬(50~300%, 드래그), 모바일 네이티브 핀치줌, 키보드 화살표 네비게이션,
터치 스와이프, IME 대응(`enterKeyHint`) 등 PhotoSwipe급 핵심 기능을 자체
구현하고 있다. **라이브러리 교체는 권장하지 않는다** — 태그/댓글/모임사진
연동처럼 이 앱에 깊이 커스텀된 부분을 위험을 무릅쓰고 다시 만들어야 하는데
비해 얻는 게 거의 없다. 실질적 개선 여지는 데이터 계층(이번 세션에 이미 수정)과
낙관적 UI(위 1~3번)뿐이었다.

## 처리 현황

1. **채팅 메시지 삭제 낙관화** — ✅ 완료
2. **채팅 메시지 텍스트 전용 수정 낙관화** — ✅ 완료
3. **새 메모(사진 없음) 작성 낙관화** — 조사 결과 이미 구현돼 있었음, 변경 없음

1~2번 모두 태그/댓글 작업과 동일한 방식(즉시 반영 로컬 상태 + 실패 시 롤백,
기존 스냅샷/복원 로직 재사용)으로 구현했다.
