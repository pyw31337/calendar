#!/bin/zsh
# 맥 자동화 되살리기: backup.sh가 만든 백업 하나로 새 맥(또는 다시 설치한 맥)에 자동 실행 환경을 그대로 옮긴다.
#
#   zsh restore.sh "~/Library/Mobile Documents/com~apple~CloudDocs/Moyeora Backups/moyeora-mac-backup-....tar.gz"
#   zsh restore.sh <백업> --dry-run      # 무엇을 할지 보여주기만
#   zsh restore.sh <백업> --skip-brew    # Homebrew 패키지 설치를 건너뜀
#
# 하는 일 (순서대로, 이미 있는 것은 건너뛴다):
#   1. Homebrew 패키지(Brewfile) 설치
#   2. ~/Developer 에 저장소를 GitHub에서 다시 받고 백업 때의 브랜치로 맞춤, npm 패키지 설치
#   3. 파이썬 가상환경(~/.venvs/photos 등)과 저장소 안 venv 를 같은 패키지로 다시 만듦
#   4. ~/Library/Application Support/Moyeora (사진 분석 설정·상태·얼굴 데이터) 복원
#   5. 비밀값(있으면, 암호 입력): 사진 분석 토큰을 키체인에, .env 파일을 저장소에
#   6. 사진 분석용 Vision 프로그램 다시 빌드 (맥 칩에 맞게)
#   7. 자동 실행(LaunchAgents)·crontab 을 새 맥의 경로로 고쳐 설치하고 켬
#   8. 자동 실행 상태 확인
set -euo pipefail
# MOYEORA_BACKUP_PASSPHRASE (optional, for unattended runs) instead of typing the secrets passphrase.
PASS_ARGS=()
if [[ -n "${MOYEORA_BACKUP_PASSPHRASE:-}" ]]; then PASS_ARGS=(-pass env:MOYEORA_BACKUP_PASSPHRASE); fi

ARCHIVE="${1:-}"
[[ -n "$ARCHIVE" && -f "$ARCHIVE" ]] || { print -u2 "사용법: zsh restore.sh <moyeora-mac-backup-....tar.gz> [--dry-run] [--skip-brew]"; exit 2; }
shift
DRY=0; SKIP_BREW=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY=1 ;;
    --skip-brew) SKIP_BREW=1 ;;
    *) print -u2 "알 수 없는 옵션: $arg"; exit 2 ;;
  esac
done

run() { if (( DRY )); then print "  [미리보기] $*"; else "$@"; fi }
step() { print "\n== $*"; }

TMP="$(/usr/bin/mktemp -d)"
trap '/bin/rm -rf "$TMP"' EXIT
/usr/bin/tar -C "$TMP" -xzf "$ARCHIVE"
SRC=("$TMP"/moyeora-mac-backup-*(N/))
[[ ${#SRC} -eq 1 ]] || { print -u2 "백업 파일 형식이 아닙니다."; exit 1; }
SRC="${SRC[1]}"
source "$SRC/meta.env"
NEW_DEVELOPER_DIR="${MOYEORA_DEVELOPER_DIR:-$HOME/Developer}"
SUPPORT_DIR="$HOME/Library/Application Support/Moyeora"
print "백업: $BACKUP_HOST ($BACKUP_DATE, macOS $BACKUP_MACOS, $BACKUP_ARCH, Node $BACKUP_NODE)"
print "옛 경로 $OLD_HOME -> 새 경로 $HOME"

# 백업 안의 옛 경로(/Users/옛이름/Developer ...)를 이 맥의 경로로
rewrite_paths() {
  /usr/bin/sed -e "s|$OLD_DEVELOPER_DIR|$NEW_DEVELOPER_DIR|g" -e "s|$OLD_HOME|$HOME|g" "$1"
}

step "1. Homebrew 패키지"
if (( SKIP_BREW )); then
  print "  건너뜀 (--skip-brew)"
elif [[ -f "$SRC/Brewfile" ]]; then
  if ! command -v brew >/dev/null 2>&1; then
    print -u2 "  Homebrew가 없습니다. https://brew.sh 의 설치 명령을 먼저 실행한 뒤 다시 실행하세요."; exit 1
  fi
  run brew bundle install --file="$SRC/Brewfile" --no-upgrade
fi

step "2. 저장소 (GitHub에서 다시 받기)"
mkdir -p "$NEW_DEVELOPER_DIR"
exec 3< "$SRC/repos.tsv"   # fd 3, so git/npm below cannot swallow the list from stdin
while IFS=$'\t' read -r -u 3 name remote branch commit dirty unpushed; do
  if [[ "$name" == path || -z "$remote" ]]; then continue; fi
  target="$NEW_DEVELOPER_DIR/$name"
  if [[ -d "$target/.git" ]]; then
    print "  $name: 이미 있음"
  elif [[ -e "$target" && -n "$(ls -A "$target" 2>/dev/null)" ]]; then
    print "  $name: 같은 이름의 폴더가 이미 있어(저장소 아님) 건너뜀 - 비우거나 이름을 바꾼 뒤 다시 실행하세요"
    continue
  else
    print "  $name: $remote 에서 받는 중"
    if ! run git clone --quiet "$remote" "$target"; then
      print "  $name: 받지 못했습니다 (GitHub 로그인 확인: gh auth login 또는 SSH 키) - 나머지는 계속합니다"
      continue
    fi
  fi
  if [[ -n "$branch" ]] && (( ! DRY )); then
    git -C "$target" fetch --quiet origin "$branch" 2>/dev/null && git -C "$target" checkout --quiet "$branch" 2>/dev/null || print "  $name: 브랜치 $branch 를 GitHub에서 찾지 못해 기본 브랜치로 둡니다"
  fi
  if (( unpushed > 0 )); then print "  $name: 백업 때 GitHub에 안 올린 기록 ${unpushed}개는 옮겨지지 않았습니다"; fi
  if [[ -f "$target/package-lock.json" ]] && (( ! DRY )); then
    (cd "$target" && npm ci --silent >/dev/null 2>&1) && print "  $name: npm 패키지 설치" || print "  $name: npm ci 실패 - 나중에 그 폴더에서 npm ci 를 직접 실행하세요"
    if [[ -d "$target/node_modules/playwright" || -d "$target/node_modules/playwright-core" ]]; then (cd "$target" && npx --yes playwright install chromium >/dev/null 2>&1 || true); fi
  fi
done
exec 3<&-

step "3. 파이썬 가상환경"
for req in "$SRC"/venvs/home-*.txt(N); do
  name="${${req:t}#home-}"; name="${name%.txt}"
  venv="$HOME/.venvs/$name"
  py="python3"
  if [[ -f "$SRC/venvs/home-$name.python" ]] && command -v "python$(<"$SRC/venvs/home-$name.python")" >/dev/null 2>&1; then py="python$(<"$SRC/venvs/home-$name.python")"; fi
  print "  ~/.venvs/$name ($py)"
  if [[ ! -x "$venv/bin/python" ]]; then run "$py" -m venv "$venv"; fi
  run "$venv/bin/python" -m pip install --quiet -r "$req"
done
for req in "$SRC"/venvs/repo-*.txt(N); do
  base="${${req:t}#repo-}"; base="${base%.txt}"
  venv_name="${base##*-}"; repo_name="${base%-*}"
  venv="$NEW_DEVELOPER_DIR/$repo_name/$venv_name"
  if [[ ! -d "$NEW_DEVELOPER_DIR/$repo_name" ]]; then continue; fi
  print "  $repo_name/$venv_name"
  if [[ ! -x "$venv/bin/python" ]]; then run python3 -m venv "$venv"; fi
  run "$venv/bin/python" -m pip install --quiet -r "$req"
done

step "4. 사진 분석 설정·상태·얼굴 데이터"
if [[ -d "$SRC/app-support-moyeora" ]]; then
  run mkdir -p "$SUPPORT_DIR"
  run /usr/bin/rsync -a "$SRC/app-support-moyeora/" "$SUPPORT_DIR/"
  if [[ -f "$SUPPORT_DIR/media-worker.json" ]] && (( ! DRY )); then
    rewrite_paths "$SUPPORT_DIR/media-worker.json" > "$SUPPORT_DIR/media-worker.json.new"
    # facePython pointed at the old Mac's venv; the venv was rebuilt above at the same new path.
    /bin/mv "$SUPPORT_DIR/media-worker.json.new" "$SUPPORT_DIR/media-worker.json"
    /bin/chmod 600 "$SUPPORT_DIR/media-worker.json"
  fi
fi

step "5. 비밀값"
if [[ -f "$SRC/secrets.tar.gz.enc" ]]; then
  if (( DRY )); then
    print "  [미리보기] 암호를 물어보고 토큰·.env 를 복원"
  else
    SECRETS="$TMP/secrets"; mkdir -p "$SECRETS"
    # Same Mac (or its Keychain restored): the --auto backup passphrase is already there.
    if (( ${#PASS_ARGS} == 0 )) && MOYEORA_BACKUP_PASSPHRASE="$(/usr/bin/security find-generic-password -a "$USER" -s "Moyeora Backup Passphrase" -w 2>/dev/null)"; then
      export MOYEORA_BACKUP_PASSPHRASE; PASS_ARGS=(-pass env:MOYEORA_BACKUP_PASSPHRASE)
      print "  이 맥 키체인의 자동 백업 암호를 씁니다."
    else
      print "  백업 암호를 입력하세요. 어드민 버튼으로 만든 백업이면 옛 맥에서"
      print "  'zsh ~/Developer/calendar/tools/mac-automation/backup.sh --print-passphrase' 로 본 암호입니다."
    fi
    /usr/bin/openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 "${PASS_ARGS[@]}" -in "$SRC/secrets.tar.gz.enc" | /usr/bin/tar -C "$SECRETS" -xzf -
    if [[ -f "$SECRETS/media-worker-token" ]]; then
      service="$(<"$SECRETS/media-worker-token.service")"
      /usr/bin/security add-generic-password -U -a "$USER" -s "$service" -w "$(<"$SECRETS/media-worker-token")"
      print "  사진 분석 토큰을 키체인에 넣었습니다"
      # The worker looks the token up by the account recorded in its config.
      if [[ -f "$SUPPORT_DIR/media-worker.json" ]]; then /usr/bin/plutil -replace tokenAccount -string "$USER" "$SUPPORT_DIR/media-worker.json"; fi
    fi
    if [[ -d "$SECRETS/env" ]]; then
      (cd "$SECRETS/env" && find . -type f) | while read -r rel; do
        rel="${rel#./}"
        dest="$NEW_DEVELOPER_DIR/$rel"
        if [[ -e "$dest" ]]; then print "  $rel: 이미 있어 그대로 둠"; else mkdir -p "${dest:h}"; /bin/cp "$SECRETS/env/$rel" "$dest"; /bin/chmod 600 "$dest"; print "  $rel 복원"; fi
      done
    fi
  fi
else
  print "  백업에 비밀값이 없습니다."
  if [[ -s "$SRC/secret-files.txt" ]]; then print "  옛 맥에서 직접 옮겨야 하는 파일:"; /usr/bin/sed 's/^/    - /' "$SRC/secret-files.txt"; fi
  print "  사진 분석 토큰은 calendar/tools/local-media-worker/setup-media-analysis-worker.sh 를 다시 실행하면 새로 만듭니다."
fi

step "6. 사진 분석 Vision 프로그램 빌드"
SWIFT_SRC="$NEW_DEVELOPER_DIR/calendar/tools/local-media-worker/MediaInsight.swift"
if [[ -f "$SWIFT_SRC" ]]; then
  run mkdir -p "$SUPPORT_DIR/bin"
  run /usr/bin/xcrun swiftc -O "$SWIFT_SRC" -o "$SUPPORT_DIR/bin/media-insight"
else
  print "  calendar 저장소가 없어 건너뜀"
fi

step "7. 자동 실행 설치"
AGENT_DIR="$HOME/Library/LaunchAgents"
run mkdir -p "$AGENT_DIR"
for plist in "$SRC"/launch-agents/*.plist(N); do
  target="$AGENT_DIR/${plist:t}"
  if (( DRY )); then print "  [미리보기] ${plist:t}"; continue; fi
  rewrite_paths "$plist" > "$target"
  /usr/bin/plutil -lint "$target" >/dev/null
  # 로그 폴더가 없으면 launchd가 작업을 시작하지 못한다
  /usr/bin/plutil -extract StandardOutPath raw -o - "$target" 2>/dev/null | { read -r out && mkdir -p "${out:h}"; } || true
  /usr/bin/plutil -extract StandardErrorPath raw -o - "$target" 2>/dev/null | { read -r err && mkdir -p "${err:h}"; } || true
  /bin/launchctl bootout "gui/$(/usr/bin/id -u)" "$target" 2>/dev/null || true
  /bin/launchctl bootstrap "gui/$(/usr/bin/id -u)" "$target" && print "  ${plist:t} 켬" || print "  ${plist:t} 켜기 실패 - 위 경로가 이 맥에 있는지 확인하세요"
done
if [[ -s "$SRC/crontab.txt" ]]; then
  if (( DRY )); then
    print "  [미리보기] crontab 복원"
  elif /usr/bin/crontab -l >/dev/null 2>&1 && [[ -n "$(/usr/bin/crontab -l)" ]]; then
    print "  이 맥에 이미 crontab 이 있어 덮어쓰지 않았습니다. 백업 내용:"; rewrite_paths "$SRC/crontab.txt" | /usr/bin/sed 's/^/    /'
  else
    rewrite_paths "$SRC/crontab.txt" | /usr/bin/crontab - && print "  crontab 복원"
  fi
fi

step "8. 상태"
if (( ! DRY )); then
  sleep 3
  /bin/launchctl list | /usr/bin/grep -E "com\.(moyeora|cultureflow|pyw31337)\." || print "  (켜진 자동 실행이 없습니다)"
  print "\n가운데 숫자 0 = 정상, - = 아직 한 번도 안 돎. 다른 숫자면 tools/mac-automation/status.sh 로 로그를 보세요."
fi
