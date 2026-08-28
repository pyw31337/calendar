import fs from 'node:fs';

const services = fs.readFileSync('src/core/firebase-services.js', 'utf8');
const data = fs.readFileSync('src/core/app-firebase-data.js', 'utf8');
const helpers = fs.readFileSync('src/core/app-domain-helpers.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`[egress-safety] failed: ${message}`);
    process.exit(1);
  }
}

assert(/collection\('messages'\)[\s\S]{0,180}limit\(pageSize\)/.test(services), 'message page reads must stay bounded');
assert(/collection\('messages'\)[\s\S]{0,220}limit\(80\)/.test(services), 'message realtime reads must have a bounded default');
assert(/pageSize=500/.test(data), 'full subcollection fallbacks must use an explicit page size');
assert(/message\.thumbUrl \|\| message\.thumbUrls\?\.\[0\]/.test(helpers), 'notification/media summaries must prefer thumbnails');
assert(!/getDownloadURL\([^)]*imageUrl/.test(data), 'data records must not resolve Storage URLs repeatedly from render data');

console.log('[egress-safety] passed: bounded message reads, explicit REST page sizes, and thumbnail-first summaries are intact');
