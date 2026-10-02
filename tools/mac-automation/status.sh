#!/bin/zsh
# 맥 자동화 상태 한눈에 보기: 자동 실행마다 마지막 결과와 최근 로그를 보여준다.
#   zsh tools/mac-automation/status.sh
setopt null_glob
AGENT_PREFIXES=(${=MOYEORA_AGENT_PREFIXES:-com.moyeora. com.cultureflow. com.pyw31337.})
for prefix in $AGENT_PREFIXES; do
  for plist in "$HOME/Library/LaunchAgents/$prefix"*.plist; do
    label="${${plist:t}%.plist}"
    line="$(/bin/launchctl list | /usr/bin/awk -v l="$label" '$3 == l')"
    code="$(print -r -- "$line" | /usr/bin/awk '{print $2}')"
    case "$code" in
      0) state="정상" ;;
      '') state="꺼져 있음 (launchctl bootstrap gui/$(id -u) $plist)" ;;
      -) state="아직 안 돎" ;;
      *) state="오류 (마지막 종료 코드 $code)" ;;
    esac
    print "\n■ $label: $state"
    err="$(/usr/bin/plutil -extract StandardErrorPath raw -o - "$plist" 2>/dev/null)"
    out="$(/usr/bin/plutil -extract StandardOutPath raw -o - "$plist" 2>/dev/null)"
    if [[ "$code" != 0 && -s "$err" ]]; then
      print "  최근 오류 ($(/bin/date -r "$err" '+%m/%d %H:%M')):"; /usr/bin/tail -4 "$err" | /usr/bin/sed 's/^/    /'
    elif [[ -s "$out" ]]; then
      print "  최근 기록 ($(/bin/date -r "$out" '+%m/%d %H:%M')):"; /usr/bin/tail -2 "$out" | /usr/bin/sed 's/^/    /'
    fi
  done
done
REPORT="$HOME/Library/Application Support/Moyeora/media-analysis-scheduler-latest.json"
if [[ -f "$REPORT" ]]; then
  print "\n■ 사진 분석 마지막 실행 결과 ($(/bin/date -r "$REPORT" '+%m/%d %H:%M'))"
  /usr/bin/plutil -p "$REPORT" 2>/dev/null | /usr/bin/grep -E '"(status|calendarId|ok|error)"' | /usr/bin/sed 's/^/  /'
fi
BACKUPS=("$HOME/Library/Mobile Documents/com~apple~CloudDocs/Moyeora Backups"/moyeora-mac-backup-*.tar.gz(om) "$HOME/Desktop/Moyeora Backups"/moyeora-mac-backup-*.tar.gz(om))
if (( ${#BACKUPS} )); then
  print "\n■ 가장 최근 백업: ${BACKUPS[1]:t}"
else
  print "\n■ 백업이 아직 없습니다: zsh tools/mac-automation/backup.sh"
fi
