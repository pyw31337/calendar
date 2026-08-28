import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
  // Find the latest backup file in ops-backups
  const backupDir = path.resolve('ops-backups');
  const files = await fs.readdir(backupDir);
  const jsonFiles = files.filter(f => f.startsWith('calendar-prod-backup-') && f.endsWith('.json')).sort();
  
  if (jsonFiles.length === 0) {
    console.error("No backup files found in ops-backups/");
    process.exit(1);
  }
  
  const latestBackup = jsonFiles[jsonFiles.length - 1];
  const backupFilePath = path.join(backupDir, latestBackup);
  console.log(`Analyzing backup file: ${latestBackup}`);
  
  const fileContent = await fs.readFile(backupFilePath, 'utf8');
  const backupData = JSON.parse(fileContent);
  
  // Set today string in KST/Local format
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  console.log(`Today (Local): ${todayStr}\n`);

  const calendars = backupData.calendars || [];
  
  for (const cal of calendars) {
    const calendar = cal.data.calendar || {};
    const title = calendar.title || cal.summary.title;
    const calendarId = calendar.id;
    
    // 1. Get active participants map
    const activeParticipants = (calendar.participants || []).filter(p => p && !p.removedAt);
    const participantsMap = Object.fromEntries(activeParticipants.map(p => [p.id, true]));
    
    // 2. Group active availabilities by date
    const dateMap = {};
    const availabilities = calendar.availabilities || [];
    
    for (const e of availabilities) {
      if (!e || e.deletedAt || e.removedAt) continue;
      if (!participantsMap[e.participantId]) continue; // ignore deleted participants
      
      if (!dateMap[e.date]) {
        dateMap[e.date] = [];
      }
      dateMap[e.date].push(e);
    }
    
    // 3. Evaluate criteria for past dates
    const pastDatesOld = [];
    const pastDatesNew = [];
    const pastDatesMemosInfo = [];
    
    for (const d of Object.keys(dateMap).sort()) {
      if (d >= todayStr) continue; // ignore future dates
      
      const entries = dateMap[d];
      
      // Old logic: at least 1 active entry
      if (entries.length > 0) {
        pastDatesOld.push(d);
        
        // New logic: at least 1 entry has a non-empty memo/note
        const memoEntries = entries.filter(e => e.note && e.note.trim().length > 0);
        if (memoEntries.length > 0) {
          pastDatesNew.push(d);
          pastDatesMemosInfo.push({
            date: d,
            memos: memoEntries.map(e => `${e.participantId.split('_').pop()}: "${e.note.trim()}"`).join(', ')
          });
        }
      }
    }
    
    console.log(`=== [${title} (ID: ${calendarId})] ===`);
    console.log(`- 기존 기준 과거 모임 수: ${pastDatesOld.length}일`);
    console.log(`- 변경 기준 과거 모임 수 (메모 필수): ${pastDatesNew.length}일 (감소량: -${pastDatesOld.length - pastDatesNew.length}일)`);
    
    if (pastDatesNew.length > 0) {
      console.log(`- 변경 기준 노출 일자 및 메모 내역:`);
      for (const info of pastDatesMemosInfo) {
        console.log(`  * ${info.date} (${info.memos})`);
      }
    } else {
      console.log(`  * 변경 조건 적용 시 과거 모임 섹션에 노출되는 날짜가 없습니다.`);
    }
    console.log();
  }
}

main().catch(err => {
  console.error("Analysis failed:", err);
});
