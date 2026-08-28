import fs from 'node:fs';

const eventModals = fs.readFileSync('src/ui/ui-event-modals.js', 'utf8');
const lightbox = fs.readFileSync('src/ui/ui-lightbox.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`[accessibility-safety] failed: ${message}`);
    process.exit(1);
  }
}

assert(/className: 'modal-container',[\s\S]{0,180}role: 'dialog',[\s\S]{0,180}'aria-modal': 'true',[\s\S]{0,180}'aria-labelledby': 'settlement-modal-title'/.test(eventModals), 'settlement modal must expose dialog semantics');
assert(/id: 'settlement-modal-title'/.test(eventModals), 'settlement modal must have a labelled heading');
assert(/aria-label": "사진 삭제"/.test(lightbox) && /aria-label": "사진 편집"/.test(lightbox), 'lightbox destructive/edit actions must remain labelled');
assert(/aria-label": "이전 이미지"/.test(lightbox) && /aria-label": "다음 이미지"/.test(lightbox), 'lightbox navigation must remain labelled');

console.log('[accessibility-safety] passed: settlement dialog and lightbox controls remain accessible');
