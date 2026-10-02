# 맥 자동화 백업 · 이관

이 맥미니에서 돌아가는 자동 실행을 한 번에 백업하고, 새 맥으로 옮기거나 다시 설치한 맥에 되살린다.

| 자동 실행 | 하는 일 |
|---|---|
| `com.moyeora.media-analysis` | 사진 분석(장소·날짜·글자) + 얼굴 인식 인물 추천. 15분마다 "새 사진이 있나"만 확인(문서 1개 읽기)하고, 새 사진이 있을 때만 분석 (cw·kkot·jhair) |
| `com.cultureflow.*` | CultureFlow 매일 수집 · 업데이트 감시 |
| `com.pyw31337.cctv.*` | CCTV 캐시 갱신 · 모니터 |
| `com.moyeora.mac-backup` | 이 백업 (켜면 매주 일요일 04:10) |

## 백업

```bash
zsh ~/Developer/calendar/tools/mac-automation/backup.sh                  # 지금 백업 (비밀값 제외)
zsh ~/Developer/calendar/tools/mac-automation/backup.sh --install-weekly # 매주 자동 백업 켜기
zsh ~/Developer/calendar/tools/mac-automation/backup.sh --with-secrets   # 맥을 옮기기 직전: 비밀값까지 (암호 입력)
```

- 저장 위치: iCloud Drive `Moyeora Backups` 폴더 (iCloud가 없으면 바탕화면). 최근 8개만 남긴다.
- 담는 것: 자동 실행 설정(LaunchAgents), crontab, `~/Library/Application Support/Moyeora`(사진 분석 설정·상태·**얼굴 데이터**),
  `~/Developer` 저장소 목록(주소·브랜치·커밋), 파이썬 가상환경 패키지 목록, Homebrew 목록, Node 버전.
- 저장소 코드는 GitHub에 있으니 담지 않는다. **GitHub에 안 올린 작업이 있으면 백업 결과에 경고**가 나온다 — 그 작업은 새 맥으로 가지 않는다.
- `--with-secrets`: 사진 분석 토큰(키체인)과 저장소의 `.env` 파일을 정한 암호로 잠가(AES-256) 함께 담는다. 암호를 잊으면 풀 수 없다.
  매주 자동 백업에는 비밀값을 넣지 않는다.

## 새 맥으로 옮기기

1. 새 맥에 Xcode 명령어 도구(`xcode-select --install`), [Homebrew](https://brew.sh), GitHub 로그인(`gh auth login`)을 준비한다.
2. 옛 맥에서 `backup.sh --with-secrets` 로 마지막 백업을 만든다 (iCloud로 새 맥에 자동으로 넘어간다).
3. 새 맥에서 calendar 저장소만 먼저 받고 되살리기를 실행한다:

```bash
mkdir -p ~/Developer && git clone https://github.com/pyw31337/calendar.git ~/Developer/calendar
zsh ~/Developer/calendar/tools/mac-automation/restore.sh "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Moyeora Backups/<가장 최근 파일>.tar.gz" --dry-run   # 미리보기
zsh ~/Developer/calendar/tools/mac-automation/restore.sh "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Moyeora Backups/<가장 최근 파일>.tar.gz"
```

되살리기는 Homebrew 패키지 → 저장소 다시 받기(+npm) → 파이썬 가상환경 → 사진 분석 데이터 → 비밀값 → Vision 프로그램 빌드 →
자동 실행 설치 순서로 진행한다. 사용자 이름이 달라져도 경로(`/Users/옛이름/...`)를 새 맥에 맞게 바꿔 넣는다.
이미 있는 저장소·`.env`·crontab 은 덮어쓰지 않는다.

비밀값 없이 백업했다면 사진 분석 토큰은 `tools/local-media-worker/setup-media-analysis-worker.sh` 를 다시 실행해 새로 만들고,
`.env` 파일은 되살리기 결과에 나오는 목록대로 옛 맥에서 직접 옮긴다.

## 상태 확인

```bash
zsh ~/Developer/calendar/tools/mac-automation/status.sh
```

자동 실행마다 정상/오류와 최근 로그, 사진 분석 마지막 결과, 가장 최근 백업을 보여준다.
