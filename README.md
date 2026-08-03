# Gather Calendar

모임별 참석 가능 일정을 실시간으로 조율하는 캘린더 서비스입니다.

## 서비스 URL

- 캘린더: https://pyw31337.github.io/calendar/?id=kkot
- 공식 공유 URL: https://pyw31337.github.io/calendar/share/kkot/
- 관리자 대시보드: https://pyw31337.github.io/calendar/?admin=1

## 주요 기능

- URL의 `id` 값 기준으로 캘린더 데이터를 분리합니다.
- 기존 `?id=kkot`, `?id=cw` URL은 계속 접속용으로 지원합니다.
- 카카오톡/소셜 공유는 캘린더별 Open Graph 태그가 정적으로 포함된 `/share/{id}/` URL을 공식 공유 URL로 사용합니다.
- Firebase Firestore를 기본 저장소로 사용합니다.
- 여러 사용자가 동시에 접속해도 Firestore 실시간 구독으로 변경사항을 동기화합니다.
- 캘린더 설정에서 참여자 이름과 퍼스널 컬러를 변경하면 일정 뱃지에 함께 반영됩니다.
- 관리자 대시보드에서 전체 캘린더 현황과 데이터 품질 지표를 확인할 수 있습니다.
- 관리자 대시보드에서 캘린더별 JSON 백업을 다운로드하고, 백업 JSON으로 `kkot`, `cw` 운영 데이터를 복구할 수 있습니다.

## 로컬 검증

```bash
npm install
npm run build
npm run safety:test
```

## 운영 점검

```bash
npm run ops:audit
npm run ops:export
npm run ops:clean-stress
npm run restore:rehearsal
```

- 운영 캘린더 ID는 `kkot`, `cw`만 허용합니다.
- `ops:audit`는 Firestore의 운영 문서 크기, 참여자 수, 일정 수, 테스트 문서 잔여 여부를 점검합니다.
- `ops:export`는 운영 문서 `cal_kkot`, `cal_cw`를 `ops-backups/`에 JSON으로 백업합니다. 이 폴더는 Git에 커밋하지 않습니다.
- `ops:clean-stress`는 `cal_stress_*`, `cal_test_*` 문서 삭제를 시도합니다. Firestore 규칙상 익명 삭제가 막히면 Firebase Console 또는 인증된 Firebase CLI/Admin SDK로 삭제해야 합니다.
- `restore:rehearsal`은 운영 Firestore에 쓰지 않고, 백업 생성/파싱/검증/병합/삭제 이력 보존 흐름을 로컬 격리 환경에서 리허설합니다.
- `npm run stress:firebase`는 실제 Firestore에 테스트 문서를 생성하는 부하 테스트입니다. 운영 점검 목적이 아니라 저장 충돌 재현이 필요할 때만 실행하세요.
- 데이터베이스가 비었거나 손상되면 관리자 대시보드의 `데이터 불러오기`에서 미리 받아둔 백업 JSON을 선택해 복구합니다. 복구는 운영 캘린더 `kkot`, `cw`만 허용합니다.
- 백업 JSON 복구는 관리자 주소에 `restore=1`을 붙이고 확인 문구를 정확히 입력한 뒤 실행합니다. 복구는 운영 캘린더 `kkot`, `cw` 백업만 허용합니다.

## 데이터 보존 원칙

- 운영 캘린더의 참여자, 일정, 메모, 삭제 이력은 사용자가 직접 삭제하기 전까지 유지합니다.
- 사용자가 삭제한 일정과 참여자는 물리 삭제 대신 `deletedAt` 또는 `removedAt` 이력으로 보존해 동시 접속 병합과 복구 안전성을 유지합니다.
- 오래된 운영 기록을 자동 정리하거나 임의 삭제하는 작업은 두지 않습니다.
- 자동 백업 JSON은 이름, 일정, 메모를 포함할 수 있으므로 공개 Git 저장소에 커밋하지 않습니다. 향후 자동 원격 백업이 필요하면 비공개 저장소나 암호화 저장소를 사용합니다.
- 운영 스크립트의 삭제 대상은 `cal_stress_*`, `cal_test_*` 같은 테스트 문서로 제한하며, `cal_kkot`, `cal_cw` 운영 문서는 정리 스크립트 대상에 포함하지 않습니다.

## GitHub Actions

이 레포는 GitHub Pages 배포용 캘린더 전용 레포입니다. Megamart, Ashley, Naver Booking 같은 모니터링 워크플로는 이 레포에서 운영하지 않습니다.
