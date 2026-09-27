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
