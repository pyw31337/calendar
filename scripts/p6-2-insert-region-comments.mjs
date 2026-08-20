import fs from 'fs';

const path = 'src/core/app-main.js';
let src = fs.readFileSync(path, 'utf8');

const regions = [
  { id: 'P6-2 REGION 1 aliases', needle: 'const GATHER_APP_CONSTANTS = window.GATHER_APP_CONSTANTS || {};' },
  { id: 'P6-2 REGION 2 firebase helpers', needle: 'function bindGatherFirebaseDeps()' },
  { id: 'P6-2 REGION 3 subscriptions', needle: 'function subscribeMessages(' },
  { id: 'P6-2 REGION 4 admin routes', needle: 'function isAdminDashboardRoute()' },
  { id: 'P6-2 REGION 5 seed calendars', needle: "const INITIAL_CALENDARS = ['kkot', 'cw'].map(id => ({" },
  { id: 'P6-2 REGION 6 App component', needle: 'function App() {' },
  { id: 'P6-2 REGION 7 changeView', needle: 'const changeView = (view) => {' }
];

for (const region of regions) {
  const comment = `/* ==== ${region.id} ==== */\n`;
  if (src.includes(comment.trim())) {
    console.log('skip already present:', region.id);
    continue;
  }
  const first = src.indexOf(region.needle);
  const last = src.lastIndexOf(region.needle);
  if (first === -1) {
    console.error('MISSING marker, abort:', region.id, region.needle);
    process.exit(1);
  }
  if (first !== last) {
    console.error('DUPLICATE marker, abort:', region.id);
    process.exit(1);
  }
  src = src.slice(0, first) + comment + src.slice(first);
  console.log('inserted', region.id, 'at index', first);
}

fs.writeFileSync(path, src);
console.log('updated', path, 'bytes', src.length);
