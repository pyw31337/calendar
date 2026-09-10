/** Regression guards for the shared UI design system. */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const css = read('src/app.css');
const shared = read('src/ui/ui-shared.js');
const picker = read('src/ui/ui-summary-gallery.js');
const confirm = read('src/ui/ui-confirm-dialog.js');
const sideMenu = read('src/ui/ui-side-menu.js');
const uiSources = ['ui-calendar-core.js', 'ui-misc.js', 'ui-remaining.js', 'ui-admin-modals.js', 'ui-share-modal.js', 'ui-event-modals.js']
  .map(file => read(`src/ui/${file}`)).join('\n');
const allUiSources = readdirSync(resolve(root, 'src/ui')).filter(file => file.endsWith('.js'))
  .map(file => read(`src/ui/${file}`)).join('\n');

const failures = [];
const requireText = (text, pattern, message) => { if (!pattern.test(text)) failures.push(message); };

requireText(css, /@media \(max-width: 720px\)[\s\S]*font-size: 1rem !important/, 'mobile form controls must be at least 16px');
requireText(shared, /export function FormAddEditActionButtons/, 'shared add/edit action module missing');
requireText(shared, /height: '44px'[\s\S]*minHeight: '44px'/, 'shared add/edit actions must use 44px targets');
requireText(css, /\.btn-action[\s\S]{0,280}min-width:\s*44px/, 'action buttons must keep width >= height (min 1:1)');
requireText(shared, /minWidth: '44px'[\s\S]*padding: '0 16px'/, 'shared add/edit actions must not shrink narrower than 44px');
const chatGallery = read('src/ui/ui-chat-gallery.js');
requireText(chatGallery, /!isBulkShareMode && renderVisitFilterToggleMobile\(\)/, 'gallery edit mode must hide 전체|일자 so expanded actions fit');
requireText(chatGallery, /minWidth: '44px', padding: '0 16px'/, 'gallery text actions (취소/붙여넣기/일괄공유) must not be taller than wide');
if (/padding: isMobile \? '0 6px'/.test(chatGallery)) failures.push('gallery text actions must not use 6px mobile padding that makes 취소 taller than wide');
requireText(picker, /!isMemoryListEditMode && renderMemoryAllDateToggle\(\)/, 'memories edit mode must hide 전체|일자 like gallery');
requireText(picker, /minWidth: '44px', padding: '0 16px'/, 'memories 취소 must stay at least 1:1');
const chatFiles = read('src/ui/ui-chat-files.js');
if (/minWidth: ["']28px["']/.test(chatFiles)) failures.push('PDF zoom controls must not be narrower than their height');
requireText(chatFiles, /minWidth: "32px", padding: "0 8px"/, 'PDF zoom +/- buttons must be at least square');

requireText(picker, /export function ParticipantBackdrop/, 'participant backdrop module missing');
requireText(picker, /SimpleBottomSheetPicker: SimpleBottomSheetPicker/, 'shared picker must be registered');
requireText(confirm, /height: '44px'[\s\S]*minHeight: '44px'/, 'confirm actions must use 44px targets');
if (/window\.confirm\s*\(/.test(sideMenu)) failures.push('settings must not use native window.confirm');
if (/\balert\s*\(/.test(uiSources)) failures.push('shared UI flows must use toast/dialog primitives instead of native alert');
if (/"stroke-(?:width|linecap|linejoin)"\s*:/.test(allUiSources)) failures.push('React SVG props must use strokeWidth/strokeLinecap/strokeLinejoin');

if (failures.length) {
  failures.forEach(message => console.error('[check-design-system]', message));
  process.exit(1);
}
console.log('[check-design-system] shared modules, mobile sizing, and confirmation guards OK');
