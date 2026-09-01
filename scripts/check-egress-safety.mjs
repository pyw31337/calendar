import fs from 'node:fs';

const services = fs.readFileSync('src/core/firebase-services.js', 'utf8');
const data = fs.readFileSync('src/core/app-firebase-data.js', 'utf8');
const helpers = fs.readFileSync('src/core/app-domain-helpers.js', 'utf8');
const config = fs.readFileSync('src/core/app-config.js', 'utf8');
const main = fs.readFileSync('src/core/app-main.js', 'utf8');
const gallery = fs.readFileSync('src/ui/ui-chat-gallery.js', 'utf8');
const index = fs.readFileSync('src/index.html', 'utf8');

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
assert(/CHAT_INITIAL_MESSAGE_LIMIT:\s*5/.test(config), 'chat must retain a five-message critical first window');
assert(/CHAT_OLDER_PAGE_SIZE:\s*20/.test(config), 'older chat reads must retain small cursor pages');
assert(/!isGlobalSearchOpen \|\| fullChatHistoryByCalendar/.test(main), 'full chat history must only hydrate for an explicit search');
assert(!/visiblePhotos \|\| \[\]\)\.length >= 60[\s\S]{0,100}onLoadOlderChat/.test(gallery), 'gallery must not auto-chain older history reads');
assert(/visiblePhotos\.slice\(0, photoRenderLimit\)/.test(gallery), 'gallery must render media progressively');
assert(!/<script[^>]+firebase-storage-compat/.test(index), 'Storage SDK must stay off the initial document path');

console.log('[egress-safety] passed: bounded reads, progressive chat/gallery rendering, lazy Storage, and thumbnail-first summaries are intact');
