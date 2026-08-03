# Gather Calendar

모임별 참석 가능 일정을 실시간으로 조율하는 캘린더 서비스입니다.

## 서비스 URL

- 캘린더: https://pyw31337.github.io/calendar/?id=kkot
- 관리자 대시보드: https://pyw31337.github.io/calendar/?admin=1

## 주요 기능

- URL의 `id` 값 기준으로 캘린더 데이터를 분리합니다.
- Firebase Firestore를 기본 저장소로 사용합니다.
- 여러 사용자가 동시에 접속해도 Firestore 실시간 구독으로 변경사항을 동기화합니다.
- 캘린더 설정에서 참여자 이름과 퍼스널 컬러를 변경하면 일정 뱃지에 함께 반영됩니다.
- 관리자 대시보드에서 전체 캘린더 현황을 확인하고 새 캘린더를 생성할 수 있습니다.

## 로컬 검증

```bash
npm install
npm run build
```

## GitHub Actions

이 레포는 GitHub Pages 배포용 캘린더 전용 레포입니다. Megamart, Ashley, Naver Booking 같은 모니터링 워크플로는 이 레포에서 운영하지 않습니다.
