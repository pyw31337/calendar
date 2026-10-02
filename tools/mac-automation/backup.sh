#!/bin/zsh
# 맥 자동화 백업: 이 맥에서 돌아가는 자동 실행(사진 분석·얼굴 추천·CultureFlow 수집·CCTV 캐시 등)을
# 다른 맥으로 옮기거나 디스크가 망가졌을 때 되살릴 수 있게 한 폴더로 모은다. 되살리기는 restore.sh.
#
#   tools/mac-automation/backup.sh                  # 백업 (비밀값 제외)
#   tools/mac-automation/backup.sh --with-secrets   # 키체인 토큰·.env 파일도 암호를 걸어 함께 (이관할 때)
#   tools/mac-automation/backup.sh --install-weekly # 매주 일요일 새벽 4시 자동 백업 켜기 (비밀값 제외)
#   tools/mac-automation/backup.sh --uninstall-weekly
#   tools/mac-automation/backup.sh --auto             # 어드민 '맥 백업' 버튼이 부르는 방식: 비밀값까지, 암호는 키체인에서
#   tools/mac-automation/backup.sh --print-passphrase # --auto 백업의 암호 보기 (새 맥으로 옮길 때 필요)
#
# 담는 것: ~/Library/LaunchAgents의 우리 자동 실행 설정, crontab, ~/Library/Application Support/Moyeora
# (사진 분석 설정·상태·얼굴 데이터), ~/Developer 저장소 목록(주소·브랜치·커밋), 파이썬 가상환경 패키지 목록,
# Homebrew 목록(Brewfile), Node 버전. 저장소 코드 자체는 GitHub에 있으니 담지 않는다(되살릴 때 다시 받음).
# 저장 위치: iCloud Drive의 "Moyeora Backups" (없으면 바탕화면). 최근 8개만 남긴다.
set -euo pipefail
# MOYEORA_BACKUP_PASSPHRASE (optional, for unattended runs) instead of typing the secrets passphrase.
PASS_ARGS=()
if [[ -n "${MOYEORA_BACKUP_PASSPHRASE:-}" ]]; then PASS_ARGS=(-pass env:MOYEORA_BACKUP_PASSPHRASE); fi

SCRIPT_PATH="${0:A}"
DEVELOPER_DIR="${MOYEORA_DEVELOPER_DIR:-$HOME/Developer}"
AGENT_PREFIXES=(${=MOYEORA_AGENT_PREFIXES:-com.moyeora. com.cultureflow. com.pyw31337.})
SUPPORT_DIR="$HOME/Library/Application Support/Moyeora"
ICLOUD_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs"
DEST_ROOT="${MOYEORA_BACKUP_DIR:-}"
if [[ -z "$DEST_ROOT" ]]; then
  if [[ -d "$ICLOUD_DIR" ]]; then DEST_ROOT="$ICLOUD_DIR/Moyeora Backups"; else DEST_ROOT="$HOME/Desktop/Moyeora Backups"; fi
fi
KEEP=8
WEEKLY_LABEL="com.moyeora.mac-backup"
WEEKLY_PLIST="$HOME/Library/LaunchAgents/$WEEKLY_LABEL.plist"

WITH_SECRETS=0
QUIET=0
AUTO=0
PASSPHRASE_SERVICE="Moyeora Backup Passphrase"
PASSPHRASE_CREATED=0
RESULT_JSON="$SUPPORT_DIR/mac-backup-latest.json"
for arg in "$@"; do
  case "$arg" in
    --with-secrets) WITH_SECRETS=1 ;;
    --auto) AUTO=1; WITH_SECRETS=1; QUIET=1 ;;
    --print-passphrase)
      if /usr/bin/security find-generic-password -a "$USER" -s "$PASSPHRASE_SERVICE" -w 2>/dev/null; then exit 0; fi
      print -u2 "아직 자동 백업 암호가 없습니다. 어드민 '맥 백업'에서 한 번 백업하면 만들어집니다."; exit 1 ;;
    --quiet) QUIET=1 ;;
    --install-weekly)
      mkdir -p "${WEEKLY_PLIST:h}" "$SUPPORT_DIR"
      cat > "$WEEKLY_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$WEEKLY_LABEL</string>
  <key>ProgramArguments</key>
  <array><string>/bin/zsh</string><string>$SCRIPT_PATH</string><string>--quiet</string></array>
  <key>StartCalendarInterval</key><dict><key>Weekday</key><integer>0</integer><key>Hour</key><integer>4</integer><key>Minute</key><integer>10</integer></dict>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string></dict>
  <key>StandardOutPath</key><string>$SUPPORT_DIR/mac-backup.log</string>
  <key>StandardErrorPath</key><string>$SUPPORT_DIR/mac-backup.error.log</string>
</dict>
</plist>
PLIST
      /usr/bin/plutil -lint "$WEEKLY_PLIST" >/dev/null
      /bin/launchctl bootout "gui/$(/usr/bin/id -u)" "$WEEKLY_PLIST" 2>/dev/null || true
      /bin/launchctl bootstrap "gui/$(/usr/bin/id -u)" "$WEEKLY_PLIST"
      print "매주 일요일 04:10 자동 백업을 켰습니다 -> $DEST_ROOT"
      exit 0 ;;
    --uninstall-weekly)
      /bin/launchctl bootout "gui/$(/usr/bin/id -u)" "$WEEKLY_PLIST" 2>/dev/null || true
      /bin/rm -f "$WEEKLY_PLIST"
      print "자동 백업을 껐습니다."
      exit 0 ;;
    *) print -u2 "알 수 없는 옵션: $arg"; exit 2 ;;
  esac
done

say() { (( QUIET )) || print -- "$@"; }

# --auto: the passphrase lives in this Mac's Keychain (made once, 32 random bytes), so a backup
# started from the admin page needs nobody at the keyboard and always includes the secrets.
if (( AUTO )) && [[ -z "${MOYEORA_BACKUP_PASSPHRASE:-}" ]]; then
  if ! MOYEORA_BACKUP_PASSPHRASE="$(/usr/bin/security find-generic-password -a "$USER" -s "$PASSPHRASE_SERVICE" -w 2>/dev/null)"; then
    MOYEORA_BACKUP_PASSPHRASE="$(/usr/bin/openssl rand -base64 32 | /usr/bin/tr -d '\n')"
    /usr/bin/security add-generic-password -a "$USER" -s "$PASSPHRASE_SERVICE" -w "$MOYEORA_BACKUP_PASSPHRASE" -U
    PASSPHRASE_CREATED=1
  fi
  export MOYEORA_BACKUP_PASSPHRASE
  PASS_ARGS=(-pass env:MOYEORA_BACKUP_PASSPHRASE)
fi

STAMP="$(/bin/date +%Y%m%d-%H%M)"
HOST="$(/usr/sbin/scutil --get LocalHostName 2>/dev/null || /bin/hostname -s)"
NAME="moyeora-mac-backup-$HOST-$STAMP"
WORK="$(/usr/bin/mktemp -d)/$NAME"
mkdir -p "$WORK/launch-agents" "$WORK/venvs" "$DEST_ROOT"
trap '/bin/rm -rf "${WORK:h}"' EXIT

# --- 기본 정보: restore.sh가 경로를 새 맥에 맞게 바꿀 때 쓴다
{
  print "OLD_HOME=${(q)HOME}"
  print "OLD_USER=${(q)USER}"
  print "OLD_DEVELOPER_DIR=${(q)DEVELOPER_DIR}"
  print "BACKUP_HOST=${(q)HOST}"
  print "BACKUP_DATE=${(q)STAMP}"
  print "BACKUP_MACOS=${(q)$(/usr/bin/sw_vers -productVersion 2>/dev/null || print unknown)}"
  print "BACKUP_ARCH=${(q)$(/usr/bin/uname -m)}"
  print "BACKUP_NODE=${(q)$(node -v 2>/dev/null || print none)}"
} > "$WORK/meta.env"

# --- 자동 실행 설정 (LaunchAgents) + crontab
agents=0
for prefix in $AGENT_PREFIXES; do
  for plist in "$HOME/Library/LaunchAgents/$prefix"*.plist(N); do
    if [[ "${plist:t}" == "$WEEKLY_LABEL.plist" ]]; then continue; fi
    /bin/cp "$plist" "$WORK/launch-agents/"; agents=$((agents + 1))
  done
done
/usr/bin/crontab -l > "$WORK/crontab.txt" 2>/dev/null || : > "$WORK/crontab.txt"

# --- 사진 분석 설정·상태·얼굴 데이터 (로그와 임시 파일은 뺀다)
if [[ -d "$SUPPORT_DIR" ]]; then
  /usr/bin/rsync -a --exclude '*.log' --exclude '.media-worker-token*' --exclude 'face-models/' "$SUPPORT_DIR/" "$WORK/app-support-moyeora/"
fi

# --- 저장소 목록: 코드는 GitHub에서 다시 받고, 올리지 않은 작업이 있으면 경고만 남긴다
print -r -- $'path\tremote\tbranch\tcommit\tuncommitted\tunpushed' > "$WORK/repos.tsv"
warn_repos=()
for repo in "$DEVELOPER_DIR"/*(N/); do
  if [[ ! -e "$repo/.git" || -f "$repo/.git" ]]; then continue; fi   # not a repo, or a worktree (its main checkout is listed)
  remote="$(git -C "$repo" remote get-url origin 2>/dev/null || print '')"
  branch="$(git -C "$repo" branch --show-current 2>/dev/null || print '')"
  commit="$(git -C "$repo" rev-parse HEAD 2>/dev/null || print '')"
  dirty="$(git -C "$repo" status --porcelain 2>/dev/null | /usr/bin/wc -l | /usr/bin/tr -d ' ')"
  unpushed="$(git -C "$repo" log HEAD --not --remotes --oneline 2>/dev/null | /usr/bin/wc -l | /usr/bin/tr -d ' ')"
  print -r -- "${repo:t}"$'\t'"$remote"$'\t'"$branch"$'\t'"$commit"$'\t'"$dirty"$'\t'"$unpushed" >> "$WORK/repos.tsv"
  if (( unpushed > 0 )); then warn_repos+=("${repo:t}: GitHub에 안 올린 기록 ${unpushed}개"); fi
  # 저장소 안의 파이썬 가상환경(venv, .venv)도 패키지 목록을 남긴다
  for venv in "$repo/venv" "$repo/.venv"; do
    if [[ -x "$venv/bin/python" ]]; then "$venv/bin/python" -m pip freeze > "$WORK/venvs/repo-${repo:t}-${venv:t}.txt" 2>/dev/null || true; fi
  done
done

# --- ~/.venvs 의 가상환경 (사진 도구: ~/.venvs/photos)
for venv in "$HOME/.venvs"/*(N/); do
  if [[ ! -x "$venv/bin/python" ]]; then continue; fi
  "$venv/bin/python" -m pip freeze > "$WORK/venvs/home-${venv:t}.txt" 2>/dev/null || true
  "$venv/bin/python" -c 'import sys; print("%d.%d" % sys.version_info[:2])' > "$WORK/venvs/home-${venv:t}.python" 2>/dev/null || true
done

# --- Homebrew / npm 전역 패키지
if command -v brew >/dev/null 2>&1; then brew bundle dump --force --file="$WORK/Brewfile" >/dev/null 2>&1 || true; fi
npm ls -g --depth=0 --parseable 2>/dev/null | /usr/bin/sed -n 's|.*/node_modules/||p' > "$WORK/npm-globals.txt" || true

# --- 비밀값 (선택): 사진 분석 토큰 + 저장소 .env 파일, 암호를 걸어서
secret_files=()
for repo in "$DEVELOPER_DIR"/*(N/); do
  for f in "$repo"/.env(N) "$repo"/.env.*(N) "$repo"/*/.env(N) "$repo"/*/.env.local(N); do
    if [[ "$f" == *.example || "$f" == *.sample || "$f" == */node_modules/* ]]; then continue; fi
    secret_files+=("${f#$DEVELOPER_DIR/}")
  done
done
print -l -- $secret_files > "$WORK/secret-files.txt"
if (( WITH_SECRETS )); then
  SECRETS_DIR="$(/usr/bin/mktemp -d)"
  mkdir -p "$SECRETS_DIR/env"
  CONFIG="$SUPPORT_DIR/media-worker.json"
  if [[ -f "$CONFIG" ]]; then
    service="$(/usr/bin/plutil -extract tokenService raw -o - "$CONFIG" 2>/dev/null || print 'Moyeora Media Analysis Worker')"
    account="$(/usr/bin/plutil -extract tokenAccount raw -o - "$CONFIG" 2>/dev/null || print "$USER")"
    if /usr/bin/security find-generic-password -a "$account" -s "$service" -w > "$SECRETS_DIR/media-worker-token" 2>/dev/null; then
      print -r -- "$service" > "$SECRETS_DIR/media-worker-token.service"
    else
      /bin/rm -f "$SECRETS_DIR/media-worker-token"
    fi
  fi
  for rel in $secret_files; do
    mkdir -p "$SECRETS_DIR/env/${rel:h}"
    /bin/cp "$DEVELOPER_DIR/$rel" "$SECRETS_DIR/env/$rel"
  done
  print "비밀값을 묶습니다. 새 맥에서 되살릴 때 쓸 암호를 정해 입력하세요 (잊으면 복구할 수 없어요)."
  /usr/bin/tar -C "$SECRETS_DIR" -czf - . | /usr/bin/openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt "${PASS_ARGS[@]}" -out "$WORK/secrets.tar.gz.enc"
  /bin/rm -rf "$SECRETS_DIR"
fi

# --- 하나로 묶어 저장, 오래된 백업 정리
ARCHIVE="$DEST_ROOT/$NAME.tar.gz"
/usr/bin/tar -C "${WORK:h}" -czf "$ARCHIVE" "$NAME"
/bin/chmod 600 "$ARCHIVE"
old=("$DEST_ROOT"/moyeora-mac-backup-*.tar.gz(N.Om))
if (( ${#old} > KEEP )); then /bin/rm -f "${(@)old[1,$(( ${#old} - KEEP ))]}"; fi

say "백업 완료: $ARCHIVE"
say "  자동 실행 설정 ${agents}개, 저장소 $(( $(/usr/bin/wc -l < "$WORK/repos.tsv") - 1 ))개, 비밀값 $( (( WITH_SECRETS )) && print '포함(암호)' || print '제외')"
if (( ${#warn_repos} )); then
  say "  주의: 아래 저장소는 GitHub에 안 올린 작업이 있어 새 맥에서는 사라집니다:"
  for w in $warn_repos; do say "    - $w"; done
fi
if (( ! WITH_SECRETS && ${#secret_files} > 0 )); then say "  .env 같은 비밀 파일 ${#secret_files}개는 빠졌습니다. 이관할 때는 --with-secrets 로 한 번 더 백업하세요."; fi

# Summary for the admin page (no secret in it): what was saved, where, and what needs attention.
json_str() { local v="${1//\\/\\\\}"; v="${v//\"/\\\"}"; print -rn -- "\"$v\""; }
{
  print -n '{"ok":true,"at":'"$(( $(/bin/date +%s) * 1000 ))"
  print -n ',"file":'; json_str "${ARCHIVE:t}"
  print -n ',"folder":'; json_str "${DEST_ROOT/#$HOME/~}"
  print -n ',"sizeBytes":'"$(/usr/bin/stat -f %z "$ARCHIVE")"
  print -n ',"withSecrets":'"$( (( WITH_SECRETS )) && print true || print false )"
  print -n ',"agents":'"${agents:-0}"',"repos":'"$(( $(/usr/bin/wc -l < "$WORK/repos.tsv") - 1 ))"
  print -n ',"host":'; json_str "$HOST"
  print -n ',"passphraseCreated":'"$( (( PASSPHRASE_CREATED )) && print true || print false )"
  print -n ',"warnings":['
  first=1; for w in $warn_repos; do (( first )) || print -n ','; first=0; json_str "GitHub에 안 올린 작업: $w"; done
  print ']}'
} > "$RESULT_JSON"
if (( AUTO )); then print -r -- "$ARCHIVE"; fi
