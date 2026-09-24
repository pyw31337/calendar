# 데이터 아키텍처 v3 — 전수조사 결과와 재설계안

작성: 2026-09-24. 대상: 모여라 달력 전체 데이터 계층 (사진·파일·링크·태그·댓글·추억·인물·일정).
목표: 같은 데이터를 채팅·갤러리·일정·장소·추억·인물 어디서 접근·편집·삭제해도 결과가 항상 하나로
일치하고, 수만 명 사용자 / 수억 개 자산 규모에서도 반복 오류 없이 운영 가능한 구조.

> 이 문서는 "왜 수십 번 고쳐도 썸네일·태그·댓글 문제가 다시 생기는가"에 대한 답이다. 개별 화면 버그가
> 아니라 **데이터 모델이 같은 사실을 여러 곳에 복사해 두고, 그 사본들을 서로 다른 경로가 제각각 고치는
> 구조**라서 생긴다. 화면을 아무리 고쳐도 사본이 어긋나는 한 증상은 다른 화면에서 다시 나타난다.

---

## 1. 전수조사 — 라이브 데이터 실측 (cw 캘린더, 2026-09-24, 읽기 전용)

측정 스크립트: `scripts/audit-media-integrity.mjs` (이 PR에서 추가, 읽기 전용, 캘린더 ID는 인자로 받음).

| 항목 | 값 | 의미 |
|---|---|---|
| photoIndex 행 | 908 | 서버가 만든 갤러리 인덱스 |
| **Storage 파일이 지워졌는데 남아 있는 사진** | **31 (3.4%)** | 원본·썸네일 모두 404 → 모든 화면에서 깨진 썸네일 |
| 그중 소스 문서가 여전히 참조 | 38건 참조 | 일정 앨범 사본 32, 채팅 메시지 18 (중복 포함) |
| 인덱스 owner 중 실제로는 소스에 없는 것 | 31 / 1,598 (≈2%) | 인덱스가 소스와 어긋남 (트리거 누락/역순 처리) |
| **여러 곳에 사본이 있는 사진 중 태그가 서로 다른 것** | **562 / 882 (64%)** | 채팅 `260808 도연 도은 서준 흔들카` ↔ 일정 앨범 `260808 서준` |
| 태그를 배열 위치로만 저장한 메시지 | 199 | 앞 사진을 지우면 뒤 사진 태그가 한 칸씩 밀림 |
| 위치 기반 키로 저장된 댓글 스레드 | 19 / 98 | `chat:메시지:순번` → 앞 사진 삭제 시 옆 사진으로 이동 |
| 어떤 사진에도 연결되지 않는 댓글 | 4 스레드 (6개) | 화면에 영영 안 보임 |
| 추억 그룹 멤버십 | 날짜 구간 자동 수집 | 불꽃축제(9/5)가 고성 여행(9/4~6) 안에 겹쳐 같은 사진이 두 추억에 표시 |
| 보안 규칙의 인증 검사 (`request.auth`) | **0건** | 캘린더 ID만 알면 누구나 모든 데이터·Storage 파일 수정/삭제 가능 |

세 캘린더 비교 (같은 스크립트):

| 캘린더 | 사진 | 깨진 사진 | 소스의 죽은 참조 | 사본 태그 불일치 | 위치 기반 태그만 있는 메시지 |
|---|---|---|---|---|---|
| cw | 908 | 31 | 76 | 562 / 882 (64%) | 199 |
| kkot | 484 | 2 | 4 | 434 / 478 (91%) | 34 |
| jhair | 548 | 2 | 4 | 403 / 534 (75%) | 145 |

P1 복구 도구 dry-run (`REPAIR_CALENDAR_IDS=cw,kkot,jhair npm run ops:integrity-repair`, 쓰기 없음):
일정 80개 문서 변경 예정 — 죽은 앨범 항목 38개 제거, 앨범 사본 태그 1,472건을 원본 메시지 태그로 통일,
판단 불가(충돌) 0건. 메시지 안의 죽은 참조 16건은 보고만 한다.

참고: 이 샌드박스의 프록시는 Chromium/Firefox의 Storage 이미지 요청을 400으로 바꿔 버려서, 헤드리스
Chromium에서는 모든 사진이 깨져 보였다. 이것은 테스트 환경 문제이고 실제 서비스 원인이 아니다
(curl·WebKit·Node 경유 요청은 200). 위 수치는 Storage를 직접 조회해 확인한 값이다.

## 2. 근본 원인 (구조적)

1. **사본(copy) 기반 모델.** 일정 앨범(`confirmedMeetings.photos[]`)이 사진의 URL·태그를 자기 안에
   복사해 둔다. 원본 메시지의 태그가 바뀌거나 사진이 지워져도 사본은 그대로 남는다 → 태그 불일치 64%,
   깨진 썸네일 31장.
2. **위치(index) 기반 식별.** `sourceMessageId + sourceImageIndex`, `imageTags[i]`, `chat:msg:i` 댓글 키
   모두 "배열의 몇 번째"를 사진의 정체성으로 쓴다. 삭제·교체·재정렬 한 번이면 뒤쪽 전부가 한 칸씩
   다른 사진을 가리킨다. 이를 보정하려는 "인덱스 한 칸씩 당기기" 코드가 여러 곳에 흩어져 있고, 하나라도
   빠지면 태그·댓글이 엉뚱한 사진에 붙는다.
3. **여러 문서를 건드리는 작업이 원자적이지 않다.** 사진 삭제 = (1) 메시지 수정 → (2) 전체 일정 목록을
   *이 기기의 로컬 사본*으로 통째로 덮어쓰기 → (3) 5초 뒤 Storage 삭제. 중간 실패, 다른 기기의 동시 수정,
   오래된 로컬 사본이 그대로 데이터 손상이 된다.
4. **참조 카운트 없는 Storage 삭제.** 파일을 지울 때 다른 문서(다른 일정 앨범, 중복 정리 후 남은
   메시지)가 아직 그 파일을 가리키는지 확인하지 않는다 → 404 참조.
5. **서버 인덱스가 증분 트리거로만 유지된다.** Firestore 트리거는 순서 보장·재시도가 없다. 한 번 놓친
   이벤트나 역순 처리는 영구히 남고, 이를 정기적으로 바로잡는 대사(reconcile) 작업이 없다 → owner 2% 오염.
6. **진실의 원천(source of truth)이 여러 개.** 태그만 해도 `imageTags[]`(위치), `imageTagMap`(자산),
   일정 사본 `photos[].tags`, 서버 `photoIndex.tags`, 클라이언트 세션 오버레이(sticky)까지 5곳이며,
   화면은 "태그가 더 많은 쪽"을 고르는 휴리스틱으로 버틴다. 어떤 화면이 어떤 사본을 읽느냐에 따라
   결과가 달라진다.
7. **암묵적 멤버십.** 추억·인물 페이지는 "날짜가 겹치면 포함", "태그 문자열에 이름이 있으면 포함" 같은
   계산 규칙으로만 구성된다. 사용자가 고친 결과(제외 목록)도 바뀔 수 있는 사진 키로 저장된다.
8. **인증·권한 부재.** 규칙이 클라이언트를 전부 신뢰하므로 서버가 불변식을 강제할 방법이 없다. 버그가
   있는 구버전 클라이언트, 악의적 요청 모두 데이터를 직접 망가뜨릴 수 있다.

## 3. 목표 아키텍처

### 3.1 원칙

- **One fact, one place.** 사진의 픽셀·태그·댓글·상태는 `Asset` 문서 한 곳에만 있다. 채팅·일정·메모·
  장소·추억은 `assetId`만 가진다(참조). 참조는 절대 사본을 만들지 않는다.
- **불변 ID.** `assetId`는 업로드 시 발급되는 무작위 ID(ULID)이며 URL·순서·해시와 무관하다. 교체해도
  같은 `assetId`에 새 버전 파일이 붙을 뿐이다 → 태그·댓글·추억 소속이 그대로 유지된다.
- **Command는 서버에서, 한 트랜잭션으로.** 여러 문서를 건드리는 작업(삭제·교체·병합·첨부·태그)은
  클라이언트가 직접 쓰지 않고 Callable Function 한 번으로 요청한다. 서버가 트랜잭션·버전 검사·감사
  로그를 책임진다.
- **Read model은 버려도 되는 투영(projection).** 갤러리 인덱스·인물 인덱스·카운트는 원천에서 언제든
  재생성 가능해야 하고, 매일 대사 작업이 차이를 찾아 고친다.
- **Storage는 GC가 지운다.** 클라이언트는 파일을 지우지 않는다. `Asset.status = deleted`이고 참조가 0인
  파일만 서버 GC가 유예기간 후 삭제한다(복구 창 확보).

### 3.2 온톨로지 (엔티티와 관계)

```
Calendar ─┬─ Member (participant, 인증 사용자와 연결)
          ├─ Asset (사진/영상/파일/링크 — 모든 미디어의 유일한 본체)
          │    ├─ tags: { people[], dates[], places[], free[] }   ← 유일한 태그 저장소
          │    ├─ comments/{commentId}                           ← 서브컬렉션 (200개 배열 한도 제거)
          │    └─ versions[] (교체 이력)
          ├─ Message ── assetIds[] (순서만 가짐)
          ├─ Meeting(확정일정) ── albumAssetIds[]  (사본 없음)
          ├─ Memo ── assetIds[]
          ├─ Place ── (Asset.tags.places 로 역참조)
          ├─ Memory(추억) ── rule{dateRange, placeIds} + include[assetId] + exclude[assetId]
          └─ Person(인물) = Member ── (Asset.tags.people 로 역참조)
```

- 인물 페이지 = `assets where tags.people array-contains memberId order by takenAt desc` (인덱스 쿼리,
  클라이언트 전체 스캔 없음).
- 추억 = 규칙(날짜 ∩ 장소) + 명시적 포함/제외(불변 assetId). 겹치는 추억은 **더 구체적인 쪽(짧은 기간,
  장소 일치)** 이 우선하며, 사용자가 옮기면 include/exclude로 영구 기록.

### 3.3 컬렉션 스키마 (요지)

`calendars/cal_{id}/assets/{assetId}`
```
kind: 'image'|'video'|'file'|'link'
status: 'active'|'deleted'|'missing'
storage: { path, thumbPath, previewPath, contentType, bytes, width, height, sha256 }
takenAt, uploadedAt, uploadedBy(memberId)
tags: { people: [memberId], dates: ['YYYY-MM-DD'], places: [placeId], free: [string] }
commentCount, refCount (서버만 갱신)
version (낙관적 동시성), updatedAt, deletedAt
```
`calendars/cal_{id}/assetsByHash/{sha256}` → `{ assetId }` (업로드 전 중복 확인, 같은 파일 재업로드 방지)

Message/Meeting/Memo는 `assetIds: string[]`만 가진다. 기존 `imageUrls/thumbUrls/imageTags/photos[]` 는
마이그레이션 기간 동안 읽기 호환용으로만 유지 후 제거.

### 3.4 불변식 (서버와 규칙이 강제)

| # | 불변식 | 강제 위치 |
|---|---|---|
| I1 | 모든 참조(assetIds)는 존재하는 active Asset을 가리킨다 | Command 트랜잭션 + 일일 대사 |
| I2 | Storage 파일은 `status=deleted && refCount=0 && 유예 경과`일 때만 삭제 | 서버 GC만 (클라이언트 delete 규칙 false) |
| I3 | 태그·댓글은 Asset에만 존재, 컨텍스트 문서에 사본 금지 | 규칙(필드 화이트리스트) + 테스트 |
| I4 | Asset ID는 불변, 교체는 버전 추가 | Command |
| I5 | 여러 문서 변경은 Command 1회 = 트랜잭션 1회 | 규칙이 클라이언트 직접 쓰기 차단 |
| I6 | 모든 Read model은 원천에서 재생성 가능 | 재생성 함수 + 대사 리포트 |
| I7 | 캘린더 데이터는 그 캘린더의 인증된 멤버만 읽기/쓰기 | 규칙(`request.auth` + membership) |

### 3.5 Command API (Callable Functions)

`attachAssets(context, assetIds)`, `detachAsset(context, assetId)`, `deleteAsset(assetId)`,
`replaceAsset(assetId, newUpload)`, `tagAsset(assetId, patch, expectedVersion)`,
`mergeAssets(winnerId, loserId)`, `addComment/editComment/deleteComment(assetId, …)`,
`setMemoryMembership(memoryId, include/exclude)`.

모두: 인증·멤버십 검사 → 트랜잭션 → `version` 비교(다른 기기가 먼저 바꿨으면 409, 클라이언트는 최신본
다시 읽고 재시도) → 감사 로그 → 응답에 새 버전 반환. 오프라인 시 클라이언트 write-queue에는 **Command**
를 쌓는다(문서 전체 덮어쓰기 금지).

### 3.6 확장성 (수만 사용자 / 수억 자산)

- **페이지네이션**: 현재 photoIndex는 `offset` 페이지 방식 → offset만큼 읽기 비용·지연이 커진다. 전부
  `startAfter` 커서 기반으로 교체.
- **썸네일**: 클라이언트가 만든 썸네일 대신 Storage 업로드 트리거가 고정 규격(256/1024, WebP/AVIF)을
  생성, 경로 불변 + `immutable` 캐시. "원본은 있는데 썸네일만 없음" 상태가 구조적으로 불가능.
- **중복 제거**: 업로드 전 SHA-256 → `assetsByHash` 확인 → 기존 Asset 재사용. 중복 정리 작업 자체가
  필요 없어진다(현재 404 사고의 발원지).
- **핫스팟 회피**: 일정 목록 전체를 한 번에 덮어쓰는 쓰기 제거(문서 단위 쓰기). 카운터는 분산 카운터
  또는 집계 쿼리.
- **쿼리 인덱스**: `(status, takenAt desc)`, `(tags.people array-contains, takenAt desc)`,
  `(tags.dates array-contains)`, `(tags.places array-contains)`.
- **비용 가드**: 클라이언트 전체 컬렉션 스캔 금지(인물·추억 계산을 서버 인덱스 쿼리로), 목록은 항상
  limit + 커서. `docs/firebase-cost-guardrails.md` 규칙 유지.
- **관측성**: 일일 무결성 대사(아래 스크립트의 서버판)가 I1~I6 위반 건수를 기록하고 0이 아니면 관리자
  알림. 배포 전 게이트에 에뮬레이터 기반 Command 테스트 추가.

### 3.7 보안 (상용 배포 전제조건)

- Firebase Auth 도입: 최초 방문은 익명 로그인, 캘린더 참여는 초대 링크(서명된 토큰)로 멤버 등록,
  원하면 Google/Apple/카카오 계정 연결. 기존 사용자는 첫 방문 시 자동으로 익명 계정 + 기존 참여자
  선택으로 이어지므로 체감 변화는 "참여자 선택" 1회뿐.
- 규칙: `isMember(calendarId)` 없이는 읽기/쓰기 불가. 멀티 문서 컬렉션(assets 등)은 클라이언트 쓰기 금지,
  Command만 허용. Storage 삭제는 서버 전용.
- 관리자 비밀번호 기반 HTTP 함수는 Auth custom claim(`admin: true`)으로 교체.

## 4. 마이그레이션 로드맵

각 단계는 독립 배포 가능하고, 이전 단계로 되돌릴 수 있어야 한다. 데이터 쓰기가 있는 단계는 반드시
`npm run ops:export` 백업 → `scripts/restore-rehearsal.mjs` 복구 리허설 → dry-run 리포트 확인 → apply 순서.

| 단계 | 내용 | 데이터 모델 변경 | 되돌리기 |
|---|---|---|---|
| **P0 (이 PR)** | 삭제 시 모든 사본·참조 정리, 참조가 남은 파일은 삭제 보류, 위치 대신 자산 키로 대상 확인, 태그 저장 시 일정 사본 동기화(write-through), 깨진 추억 커버 자동 대체, 읽기 전용 무결성 감사 스크립트 | 없음 | 커밋 revert |
| P1 | 데이터 복구: `npm run ops:integrity-repair` (이 PR에 포함, dry-run 기본, APPLY=1 시 문서별 updateTime 가드) — 죽은 앨범 항목 제거, 앨범 사본 태그 통일. 이어서 관리자 `rebuildPhotoIndex` 로 인덱스 재생성, 위치 키 댓글을 자산 키로 이관 | 없음(값 정정) | 백업 import |
| P2 | Firebase Auth + 멤버십 + 규칙 v3 (에뮬레이터 테스트 스위트 동반) | 멤버 문서 추가 | 규칙 롤백 |
| P3 | `assets` 컬렉션 + Command API. 서버가 기존 문서와 이중 기록(dual-write), 백필 | 컬렉션 추가 | 기능 플래그 off |
| P4 | 읽기 경로를 assets로 전환(갤러리→인물→추억→일정→채팅 순), 커서 페이지네이션, 서버 썸네일 | 없음 | 플래그 |
| P5 | 사본 필드 제거, 클라이언트 직접 쓰기 규칙 차단, Storage GC 가동 | 필드 제거 | 백업 import |

## 5. 사용자 결정이 필요한 항목

1. **P1 복구 apply 승인**: dry-run 결과(몇 건을 어떻게 고치는지)를 보고 적용 여부 결정.
2. **P2 인증 도입 UX**: 익명 로그인 + 초대 링크 방식으로 진행해도 되는지, 계정 연결 수단(구글/카카오).
3. **추억 멤버십 규칙**: 겹치는 추억에서 "더 구체적인 추억 우선"으로 할지, 두 곳 모두 보이게 할지.
4. **Cloud Functions / Rules 배포**: CI 자동 배포가 없으므로 각 단계의 `firebase deploy`는 수동 실행 필요.

## 6. 이 PR(P0)에서 바뀐 동작

- 사진 삭제: 같은 파일을 가리키는 **모든** 일정 앨범 항목을 함께 제거(기존: 같은 메시지 출신만).
  다른 메시지/메모가 여전히 같은 파일을 쓰면 Storage 파일은 삭제하지 않는다.
- 삭제 대상 확인: 서버 최신본에서 URL(자산 키)로 슬롯을 다시 찾아, 로컬 사본이 오래돼 순번이 달라도
  엉뚱한 사진을 지우지 않는다.
- 태그 저장: 원본 메시지/메모에 저장하면서, 같은 자산을 가진 일정 앨범 사본의 태그도 같은 값으로 갱신.
- 추억 카드 커버: 커버 사진이 깨지면 그 추억의 다음 사진으로 자동 대체.
- 사진 교체: 태그 유지, 일정 앨범 사본을 새 파일로 이동, 댓글을 새 자산 키로 이관, 옛 파일은 참조가 없을 때만 삭제.
- 인물 카드 커버도 추억 카드와 같은 자동 대체.
- `npm run ops:integrity-audit`: 위 1장의 표를 재현하는 읽기 전용 감사.
- `npm run ops:integrity-repair`: P1 복구 도구 (기본 dry-run).
