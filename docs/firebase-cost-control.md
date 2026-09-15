# Firebase 비용 제어와 실시간 동기화 계약

작성: 2026-09-15 KST

## 원칙

비용을 줄인다는 이유로 실시간 기능을 일괄 중지하지 않는다. 데이터의 시간 민감도에 따라 전송 방식을 분리한다.

| 영역 | 전송 방식 | 실시간 유지 여부 | 비용 제어 방식 |
| --- | --- | --- | --- |
| 채팅 메시지 | 제한된 Firestore listener | 유지 | 최근 문서 제한, 채널 조건, 중복 리스너 금지 |
| 타이핑 상태 | 짧은 세션 listener/heartbeat | 유지 | 세션 TTL·자기 자신 제외·백그라운드 정리 |
| 푸시 알림 | FCM/Web Push | 유지 | Firestore 문서 listener와 분리, 캘린더별 구독 검증 |
| 갤러리 사진 목록 | `photoIndex` 페이지 + 캐시 | 새 업로드만 제한적 반영 | 100개 페이지, 2분 캐시, 화면 진입 시 갱신 |
| 댓글 카운트 | `photoComments` 집계 캐시 | 뱃지 변경은 listener로 반영 | 전체 문서 point-read 금지, 세션 캐시 사용 |
| 메모·장소·추억 | 화면별 구독/페이지 조회 | 화면에 필요한 경우만 | 백그라운드 탭에서 재구독하지 않음 |
| 문화·정적 콘텐츠 | 빌드된 JSON/정적 데이터 | 없음 | 런타임 Firestore 호출 금지 |

## 절대 보존할 실시간 경로

- 채팅 수신과 전송
- 타이핑 중 표시
- 푸시 알림 등록 및 해제
- 다른 기기에서 변경된 캘린더 저장 결과

위 경로를 one-shot 조회로 바꾸면 메시지 지연·알림 누락·타이핑 상태 불일치가 발생할 수 있으므로 별도 승인 없이 변경하지 않는다.

## 비용을 줄여도 되는 경로

- 갤러리 썸네일 전체 목록
- 오래된 댓글 본문과 댓글 수의 초기 복원
- 추억/인물 집계 목록
- 문화행사·축제·스포츠 정적 데이터

이 경로는 `photoIndex`, 서버 집계 필드, 세션 캐시를 우선 사용한다. 단, 원본 `messages`·`memos`는 태그와 사진 identity의 권위 데이터로 유지하고 인덱스가 늦을 때 fallback한다.

## 현재 차단된 비용 경로

`scripts/browser-smoke-test.mjs`는 UI 회귀 테스트 컨텍스트에서 Firestore REST/Listen 요청을 차단한다. 따라서 배포·브라우저 매트릭스가 운영 캘린더 문서를 반복해서 읽지 않는다. 운영 데이터 검증은 별도의 `npm run smoke:live`에서만 의도적으로 실행한다.

## 다음 구현 순서

1. 사용자 세션별 listener attach/detach와 화면별 REST 요청 수를 개발 로그에서 계측한다(문서 내용·사용자 정보는 기록하지 않음).
2. 채팅 listener를 일반 채팅·밈 채널로 분리하되 레거시 `uploadSource` 누락 문서는 bounded fallback으로 보완한다.
3. 백그라운드 탭의 갤러리·댓글·메모 보조 구독만 중지하고, foreground 복귀 시 마지막 변경 이후만 재검증한다.
4. 댓글 수와 갤러리 총량을 서버 집계 필드로 읽는 경로를 추가하고, 기존 point-read fallback을 유지한다.
5. 각 단계마다 채팅 수신, 타이핑 표시, 푸시 등록, 댓글 뱃지 회귀를 먼저 통과시킨다.

## 검증 명령

```bash
npm run lint -- --quiet
npm test
npm run safety:test
npm run build
npm run check:dist-budget
npm run smoke:live
CALENDAR_SMOKE_BROWSER=chromium npm run smoke:browser
```

브라우저 스모크는 운영 Firestore에 연결하지 않으며, 실제 라이브 동기화 검증은 별도 읽기 전용 smoke에서 수행한다. Storage·Firestore 데이터 삭제나 대량 재작성으로 비용을 줄이지 않는다.
