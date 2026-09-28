# 사진 성능·로컬 AI 처리 운영 설계

## 이번 반영: 읽기와 썸네일 안정화

사진 원본은 서비스워커의 `moyeora-media-v1` Cache Storage가 한 번 받은 Firebase Storage
이미지를 재사용한다. 이번에는 별도로 `photoIndexMeta/summary.revision`을 추가했다.

1. 사진·태그·장소 연결이 바뀌면 Cloud Function이 해당 캘린더의 revision을 한 번 증가시킨다.
2. 클라이언트는 작은 summary 문서만 확인한다.
3. revision이 같으면 IndexedDB의 갤러리 페이지와 총량을 그대로 사용한다. 원본 이미지는 기존
   서비스워커 캐시가 사용한다.
4. revision이 다르면 해당 페이지와 총량만 새로 읽는다. 전체 갤러리를 다시 읽지 않는다.

캐시는 사진 Blob을 복제하지 않고 자산 키·썸네일 URL·태그 등 화면용 메타데이터만 최대 12개
엔트리로 보관한다. 사진 편집 직후에는 로컬 캐시를 즉시 비워 Cloud Function 반영 지연 중의
오래된 태그 재표시도 막는다. 장소·인물·추억 카드의 표지는 도착 순서가 아니라 카메라 사진 우선,
시간, 자산 키 순서로 정해져 데이터가 그대로인데 이미지가 바뀌지 않는다.

## iMac M2: 로컬 추천 워커

`tools/local-media-worker/MediaInsight.swift`는 macOS Vision을 사용해 이미지 분류, OCR,
얼굴 **개수**만 로컬에서 분석한다. 얼굴 식별·이름 추론은 하지 않는다. 결과는 자동 저장하지
않고 `suggestedTags`와 신뢰도로 된 JSON 제안으로만 남긴다.

### 설치

```bash
mkdir -p "$HOME/Pictures/Moyeora Inbox"
mkdir -p "$HOME/Library/Application Support/Moyeora"
chmod +x tools/local-media-worker/run-media-worker.sh
tools/local-media-worker/run-media-worker.sh
```

Google Photos/사진 앱에서 내보낸 **원본 파일**을 `Moyeora Inbox`에 넣으면 결과가
`~/Library/Application Support/Moyeora/media-suggestions.json`에 누적된다. 같은 파일은
경로·크기·수정 시각 서명으로 한 번만 분석한다. 새 파일은 15분 주기마다 최대 40개씩 처리한다.

자동 실행은 `com.moyeora.media-suggestions.plist.template`의 경로를 실제 절대 경로로 바꾼 뒤
`~/Library/LaunchAgents/com.moyeora.media-suggestions.plist`에 복사하고 다음처럼 등록한다.

```bash
launchctl bootout "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.moyeora.media-suggestions.plist" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.moyeora.media-suggestions.plist"
```

이 워커는 Photos 보관함을 직접 읽지 않고, 지정한 일반 폴더만 읽는다. 따라서 macOS 사진 권한을
과도하게 주지 않아도 되고, 원본·GPS·OCR 내용이 외부 AI 서비스로 전송되지 않는다.

## 다음 자동화 연결 원칙

로컬 워커가 Firestore에 직접 태그를 쓰게 하지 않는다. 다음 앱 단계에서 `mediaSuggestions`에
제안을 올리고 사용자가 `적용`을 눌렀을 때만 기존 태그와 합쳐 저장한다. 이때:

- GPS 주소화는 결정적 데이터이므로 즉시 제안한다.
- OCR·장면 분류·유사 사진은 confidence와 모델 버전을 남긴다.
- 사용자 태그는 AI 태그보다 항상 우선한다.
- 자동 적용은 중복 제거 후보와 0.9 이상 고신뢰도 태그에만 별도 승인 옵션으로 제공한다.

Cloud Run/Ollama 같은 외부 또는 네트워크 모델은 한국어 설명 품질을 높일 수 있지만, 사진을
외부로 보내는 비용·개인정보·실패 재처리 비용이 생긴다. 기본 경로는 M2의 Vision/Core ML이며,
외부 모델은 사용자가 명시적으로 켠 경우에만 보조 제안으로 사용한다.

## 상시 서버 동기화 분석 워커

`setup-media-analysis-worker.sh`는 서버의 `photoIndex`에서 **변경된 사진만** 가져와 M2 Vision으로
분석한다. 인물·장소·일정 후보, OCR, 장면, 얼굴 수, 기존 태그 문맥을 별도 `mediaAnalysis` 서버
컬렉션에 올린다. 원본 사진은 다시 업로드하지 않으며, 기존 태그·사진·댓글을 자동 수정하지 않는다.
라이브 앱은 같은 캘린더 링크 권한으로 이 추천 데이터를 읽어 어느 기기에서나 확인할 수 있다.

- 평일: KST 18:00부터 다음 날 07:59까지 15분 간격으로 변경분을 처리한다.
- 토·일 및 대한민국 공휴일: 하루 종일 같은 간격으로 처리한다.
- 공휴일은 대한민국 공휴일 ICS를 일주일에 한 번만 갱신해 로컬 캐시에 저장한다. 갱신 실패 때도
  마지막 정상 캐시를 사용한다.
- 서버로 전송하는 것은 자산 키와 분석 결과 메타데이터뿐이다. 사진 바이트는 Storage에 이미 있는
  원본을 그대로 참조한다.

### 실제 설치

```bash
cd /Users/pyw31337/Developer/calendar
MOYEORA_MEDIA_CALENDARS=cw,kkot,jhair \
  tools/local-media-worker/setup-media-analysis-worker.sh
firebase deploy --only functions:ingestMediaAnalysis,functions:recordMediaAnalysisFeedback,functions:getMediaAnalysisCalibration,firestore:rules
```

설치기는 무작위 업로드 토큰을 macOS Keychain에만 저장하고, Cloud Secret Manager에는 그 검증값만
연결한다. 토큰은 저장소·LaunchAgent·서버 분석 문서에 기록되지 않는다. `launchd`는 15분마다
가볍게 시간대를 확인하며, 비작업 시간에는 즉시 종료한다. macOS가 잠들어 예약 시각을 지나면
깨어난 뒤 실행되는 `launchd` 특성을 이용한다.

분석 결과의 최신 로컬 상태는 다음 위치에 남는다. 이는 장애 진단용이며, 실제 확인 대상은 항상
라이브 서버의 `mediaAnalysis` 데이터다.

```text
~/Library/Application Support/Moyeora/media-analysis-scheduler-latest.json
~/Library/Application Support/Moyeora/media-analysis-reports/<calendar-id>-latest.json
```

### 평일 이메일 브리핑과 장애 안전장치

평일 08:00(KST)에는 `pyw213@naver.com`으로 누적 분석 결과를 HTML 이메일로 보낸다. 메일에는
캘린더별 추천·오류·인물/장소/일정 후보 수와 라이브 검토 링크만 포함하고, 사진 원본 URL·댓글·OCR
원문은 포함하지 않는다. 발송 기록은 `operationsMediaBriefs`에 남아 이메일 보관함과 별도로 감사할 수
있다.

발송은 검증된 네이버 SMTP 발신 계정으로 처리한다. 앱 비밀번호는 Secret Manager에만 저장하며,
명령어 이력, 저장소, `launchd` 설정, 로컬 JSON에는 남지 않는다. Resend는 비상용 보조 경로로만
유지한다.

```bash
cd /Users/pyw31337/Developer/calendar
NAVER_SMTP_APP_PASSWORD='앱-비밀번호' \
MEDIA_BRIEF_FROM='모여라 캘린더 <pyw213@naver.com>' \
  tools/local-media-worker/configure-media-brief-email.sh
```

### 검토·개인화 피드백 루프

갤러리의 **AI 분석** 탭은 각 추천에 `태그 적용`, `수정`, `제외`를 제공한다. 적용은 기존 태그를
덮어쓰지 않고 합치며, 각 결정은 `mediaAnalysis.review`와 비공개 `mediaAnalysisFeedback`에 남는다.
클라이언트는 이 피드백 컬렉션을 읽거나 쓸 수 없고, 로컬 분석 워커만 별도 토큰으로 압축된 신호를
가져간다.

- 같은 Vision 레이블과 태그의 조합이 서로 다른 사진에서 두 번 이상 수락되어야 다음 추천에 반영한다.
- `제외`는 같은 조합의 점수를 낮춘다. 한 번의 우연한 적용이나 오인식은 학습 규칙이 되지 않는다.
- 원본, 파일명, 댓글, 위치 URL은 피드백 API에 보내지지 않는다. 분석은 계속 로컬 M2에서만 수행한다.
- 이 단계는 빠르게 되돌릴 수 있는 **개인화 보정**이다. 얼굴 식별·자동 인물 태깅·자동 태그 저장은
  하지 않는다.

진짜 모델 재학습(Core ML/Create ML)은 별도 동의와 평가 세트가 필요한 다음 단계다. 승인된 태그만
내보내고, 인물 식별 정보는 제외하며, 클래스별 충분한 예시와 보류 검증 세트가 있을 때에만 후보
모델을 비교·승인한다. 운영 Vision 모델은 검증 정확도가 기준보다 높을 때에만 교체한다.

안전장치는 세 겹이다.

1. `launchd`가 로컬 워커를 15분 간격으로 다시 실행하고, 변경이 없어도 서버에 생존 신호를 남긴다.
2. 서버는 토큰·캘린더·실제 `photoIndex` 자산을 모두 검증하고, 분석 결과·실패·생존 신호를 원자적으로
   기록한다. 배치가 끝나기 전에는 리비전을 완료로 표시하지 않아 80장 이후의 사진이 누락되지 않는다.
3. 이메일은 08:00·08:15·08:30·08:45에 같은 멱등성 키로 재시도한다. 발송이 불확실하거나 실패하면
   서버의 감사 문서에 남고, 다음 시도는 중복 없이 복구한다.
