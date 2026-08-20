import fs from 'fs';

const path = 'src/core/app-main.js';
let src = fs.readFileSync(path, 'utf8');

const regions = [
  { id: 'P6-2 VIEW chat', needles: ['React.createElement(ChatRoomView', "if (activeView === 'chat')"] },
  { id: 'P6-2 VIEW memo', needles: ['React.createElement(MemoView', "if (activeView === 'memo')"] },
  { id: 'P6-2 VIEW places', needles: ['React.createElement(PlacesView', "if (activeView === 'places')"] },
  { id: 'P6-2 VIEW gallery', needles: ['React.createElement(ChatGalleryModal', "if (activeView === 'gallery')"] },
  { id: 'P6-2 VIEW settlement', needles: ['React.createElement(SettlementSummaryModal', "if (activeView === 'settlement')"] },
  { id: 'P6-2 VIEW admin', needles: ['React.createElement(AdminDashboard', 'if (isAdminDashboardRoute())'] }
];

function findUnique(src, needles) {
  for (const needle of needles) {
    const first = src.indexOf(needle);
    const last = src.lastIndexOf(needle);
    if (first === -1) continue;
    if (first === last) return { needle, index: first };
    console.log('skip duplicate needle', JSON.stringify(needle), 'count-ish');
  }
  return null;
}

for (const region of regions) {
  const comment = `/* ==== ${region.id} ==== */\n`;
  if (src.includes(comment.trim())) {
    console.log('skip already present:', region.id);
    continue;
  }
  const found = findUnique(src, region.needles);
  if (!found) {
    console.error('NO unique marker, abort:', region.id);
    process.exit(1);
  }
  src = src.slice(0, found.index) + comment + src.slice(found.index);
  console.log('inserted', region.id, 'via', found.needle);
}

fs.writeFileSync(path, src);
console.log('updated', path, 'bytes', src.length);
