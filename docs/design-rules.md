# 디자인·UX 규칙 (P5-3)

서비스 전역에 공통 적용. 새 UI를 넣을 때 이 문서를 기준으로 한다.

세부 토큰·공통 모듈·모바일·확인 절차 규칙은 [design-system.md](./design-system.md)를 함께 따른다. 이 문서는 핵심 회귀 규칙의 요약이다.

## 1. 공유하기 팝업
- URL 입력 + 복사 버튼 + QR 코드
- 공유 URL은 /share/{calId}/[view]/[itemId]/ 슬래시 경로만 생성
- 검사: npm run check:share-urls

## 2. Confirm
- 삭제·위험 동작은 확인 1회만 (이중 confirm 금지)
- UI 레이어에서 confirm 후 데이터 레이어는 바로 실행
- 저장·수정·마감·복구도 상태 변경이므로 공통 `ConfirmDialog` 또는 `onRequestConfirm`을 사용한다.

## 3. 버튼
- 추가 / 저장 / 수정 / 확인: Rounded 사각형 (캡슐/pill 금지)
- 수정·삭제는 메인 채팅 섹션의 편집/삭제 모듈 스타일로 통일
- 모임 확정: 스파크·전기 테두리 + 약한 shake (과도한 glow 금지)

## 4. 셀렉트·백드롭
- 셀렉트는 장소 카테고리 셀렉트 스타일이 표준
- 백드롭 글자는 굵고 진하게
- 백드롭은 브라우저 하단에서 올라옴
- 참여자 이름은 `ParticipantBackdrop`의 퍼스널 컬러 circle + 컬러 텍스트를 사용한다.

## 5. 입력 필드
- 내용량에 따라 세로 자동 확장
- 모바일 input font-size ≥ 16px (iOS 자동 줌 방지)
- 금액·계좌번호·숫자 전용 필드는 `inputMode="numeric"` 또는 `type="number"`
- 모바일 폼은 가로 압축 대신 세로 stack을 우선한다.
- 텍스트 / URL / 날짜는 분리 표시, URL은 뱃지·새 창

## 6. 더보기·숫자 뱃지
- 더보기는 리스트 하단에 배치
- 문구: (전체 N개 중 M개 표시 중) — 50+ 같은 모호 표기 금지
- 숫자 뱃지는 전체 개수 (로드된 일부 개수 아님)

## 7. 캘린더 격리
- 데이터 경로: calendars/cal_{id}/... 만
- 캘린더 전환 시 채팅/갤러리 버퍼 초기화
- 검사: npm run check:isolation

## 8. 라이트박스·갤러리
- 갤러리 페이지에서도 썸네일 → Lightbox 렌더 필수
- 메시지 기반 이미지 수집 + lazy / 더보기

## 배포 전 검사
    npm run check:all
