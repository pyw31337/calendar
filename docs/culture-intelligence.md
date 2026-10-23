# Culture Flow 정제·중복 제거 설계

## 현재 파이프라인

`Culture Flow → scripts/sync-culture-performances.mjs → normalizeItem → mergeDuplicates → public-vite/data`

매일 갱신은 먼저 결정론적 규칙으로 처리한다. 제목 정규화만으로 합치지 않고, 정규화된 제목에 장소가 일치하며 공연 기간이 겹치는 경우에만 병합한다. `OPEN RUN`은 날짜가 없으므로 같은 장소·같은 제목일 때만 날짜가 있는 KOPIS 항목과 병합한다. 장소가 다른 투어는 같은 제목이어도 그대로 남긴다.

병합 결과는 첫 항목의 ID를 유지해 기존 캘린더의 `cultureSourceId` 링크를 깨지 않는다. 대신 다음 정보를 합친 카드에 남긴다.

- `source`: 합쳐진 출처 목록(`kopis+interpark`)
- `sourceListings`: 출처별 원본 ID와 예약/상세 링크
- `canonicalSource`: 내용이 더 풍부한 대표 출처(문화포털/KOPIS 우선)
- `bookingLinkCount`: 사용 가능한 예약·상세 링크 수

따라서 인터파크와 KOPIS에 동시에 올라온 공연은 카드 하나로 노출되지만 사용자는 두 예약처를 모두 선택할 수 있다. 반대로 같은 제목의 전국 투어는 장소·일정이 다르므로 삭제하지 않는다.

## 로컬 Mac mini 보조 처리

`tools/local-culture-worker/run-culture-intelligence.sh`는 결정론적 동기화와 품질 리포트를 항상 실행하고, 애매한 동일 제목 그룹만 로컬 Ollama에 보낸다. Ollama의 응답은 JSON 스키마로 제한된 검토 사이드카(`culture-ai-review.json`)이며, 바로 공개 데이터에 반영하지 않는다. 제안은 근거와 신뢰도를 포함하고 별도 검토·회귀 테스트를 통과한 뒤 승격해야 한다.

`CulturePosterInsight.swift`는 Mac의 Apple Vision으로 포스터 OCR과 이미지 feature print를 생성할 수 있다. OCR은 서로 다른 제목/표기나 포스터 누락을 보완하는 후보를 만들고, feature print는 같은 포스터의 재수집 여부를 비교하는 후보 키로 쓴다. 사용자 사진·원본 포스터를 클라우드로 보내지 않는 것이 기본 정책이다.

## 품질 기준

`npm run culture:quality -- --strict`는 다음을 실패로 처리한다.

- 같은 정규화 제목·장소·호환 기간이 두 카드로 남아 있음
- 포스터와 백업 포스터가 모두 없음
- 여러 출처로 병합된 카드에 `sourceListings`가 없음

제목만 같은 그룹의 수는 오류가 아니다. 투어·월별 시리즈·동일 작품의 다른 극장은 `crossSourceGroups`에 기록하고, 로컬 AI 검토 대상으로만 보낸다.

## 운영 원칙

1. 원본 사실(날짜, 장소, 가격, 링크)은 AI가 새로 만들지 않는다.
2. AI는 애매한 병합·표기 후보만 제안한다. 결정론적 규칙이 높은 신뢰도 병합을 먼저 처리한다.
3. 스냅샷이 비정상적으로 비거나 포스터가 급감하면 기존 스냅샷을 유지하고 워크플로를 실패시킨다.
4. 로컬 워커의 자동 push는 `MOYEORA_CULTURE_PUSH=1`일 때만 허용하며, 생성된 문화 데이터 파일만 커밋한다.
