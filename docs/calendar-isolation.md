# 캘린더 데이터 격리 (P3-4)

점검일: 2026-08-20

## 원칙

- Firestore 경로: calendars/cal_{calendarId}/... 만 사용
- mergeCalendarRecord는 id 불일치 시 throw
- activeCalId 변경 시 채팅/갤러리/카운트 버퍼 초기화
- 알림·참여자 pref는 캘린더별 키
- rules: calendarDocId == 'cal_' + calendar.id

## 검사

    npm run check:isolation

## 수동 스모크

1. /?id=cw 채팅·갤러리
2. /?id=kkot 전환 후 cw 데이터 미노출
3. /?id=jhair 동일
