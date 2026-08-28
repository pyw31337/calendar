/** Regression guards for the shared UI design system. */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const css = read('src/app.css');
const shared = read('src/ui/ui-shared.js');
const picker = read('src/ui/ui-summary-gallery.js');
const confirm = read('src/ui/ui-confirm-dialog.js');
const sideMenu = read('src/ui/ui-side-menu.js');

const failures = [];
const requireText = (text, pattern, message) => { if (!pattern.test(text)) failures.push(message); };

requireText(css, /@media \(max-width: 720px\)[\s\S]*font-size: 1rem !important/, 'mobile form controls must be at least 16px');
requireText(shared, /export function FormAddEditActionButtons/, 'shared add/edit action module missing');
requireText(shared, /height: '44px'[\s\S]*minHeight: '44px'/, 'shared add/edit actions must use 44px targets');
requireText(picker, /export function ParticipantBackdrop/, 'participant backdrop module missing');
requireText(picker, /SimpleBottomSheetPicker: SimpleBottomSheetPicker/, 'shared picker must be registered');
requireText(confirm, /height: '44px'[\s\S]*minHeight: '44px'/, 'confirm actions must use 44px targets');
if (/window\.confirm\s*\(/.test(sideMenu)) failures.push('settings must not use native window.confirm');

if (failures.length) {
  failures.forEach(message => console.error('[check-design-system]', message));
  process.exit(1);
}
console.log('[check-design-system] shared modules, mobile sizing, and confirmation guards OK');
