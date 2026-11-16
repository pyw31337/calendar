import fs from 'node:fs';

// Keep the coordinator from absorbing extracted feature code again. Photo-comment persistence
// now lives in photo-comment-items.js and UI compatibility wrappers are local to their actual chunk.
const targets = [
  { file: 'src/core/app-main.js', maxLines: 6000, label: 'app-main.js' },
  { file: 'src/ui/ui-summary-gallery.js', maxLines: 7500, label: 'ui-summary-gallery.js' },
  { file: 'src/app.css', maxLines: 8850, label: 'app.css' },
  { file: 'functions/index.js', maxLines: 3750, label: 'functions/index.js' },
  { file: 'src/core/app-anniversary-dates.js', maxLines: 380, label: 'app-anniversary-dates.js' },
  { file: 'src/core/app-firebase-data.js', maxLines: 4500, label: 'app-firebase-data.js' },
  { file: 'src/core/notification-pwa-state.js', maxLines: 260, label: 'notification-pwa-state.js' },
  { file: 'src/core/app-data-bootstrap.js', maxLines: 400, label: 'app-data-bootstrap.js' },
  { file: 'src/core/app-shell-state.js', maxLines: 280, label: 'app-shell-state.js' },
  { file: 'src/core/app-feedback-state.js', maxLines: 140, label: 'app-feedback-state.js' },
  { file: 'src/core/app-browser-ui-state.js', maxLines: 140, label: 'app-browser-ui-state.js' },
  { file: 'src/core/viewport-height.js', maxLines: 140, label: 'viewport-height.js' },
  { file: 'src/core/app-calendar-screen-state.js', maxLines: 140, label: 'app-calendar-screen-state.js' }
];

let failed = false;
for (const target of targets) {
  const source = fs.readFileSync(target.file, 'utf8');
  const lines = source.split('\n').length;
  if (lines > target.maxLines) {
    console.error(`[architecture-budget] ${target.label} ${lines} lines exceeds ${target.maxLines}`);
    failed = true;
  } else {
    console.log(`[architecture-budget] ${target.label} ${lines}/${target.maxLines} lines`);
  }
}

if (failed) process.exit(1);
