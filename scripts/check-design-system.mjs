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
const icons = read('src/ui/ui-icons.js');
const memoView = read('src/ui/ui-memo-view.js');
const chatRoom = read('src/ui/ui-chat-room.js');
const eventModals = read('src/ui/ui-event-modals.js');
const uiSources = ['ui-calendar-core.js', 'ui-misc.js', 'ui-remaining.js', 'ui-admin-modals.js', 'ui-share-modal.js', 'ui-event-modals.js']
  .map(file => read(`src/ui/${file}`)).join('\n');
const allUiSources = readdirSync(resolve(root, 'src/ui')).filter(file => file.endsWith('.js'))
  .map(file => read(`src/ui/${file}`)).join('\n');
const adminDashboard = read('src/ui/ui-admin-dashboard.js');
const adminModals = read('src/ui/ui-admin-modals.js');
const adminRestore = read('src/core/app-admin-restore.js');
const adminSources = [adminDashboard, adminModals, adminRestore].join('\n');

const failures = [];
const requireText = (text, pattern, message) => { if (!pattern.test(text)) failures.push(message); };

requireText(css, /@media \(max-width: 720px\)[\s\S]*font-size: 1rem !important/, 'mobile form controls must be at least 16px');
requireText(shared, /export function FormAddEditActionButtons/, 'shared add/edit action module missing');
requireText(shared, /height: '44px'[\s\S]*minHeight: '44px'/, 'shared add/edit actions must use 44px targets');
requireText(css, /\.btn-action[\s\S]{0,280}min-width:\s*44px/, 'action buttons must keep width >= height (min 1:1)');
requireText(shared, /minWidth: '44px'[\s\S]*padding: '0 16px'/, 'shared add/edit actions must not shrink narrower than 44px');
const chatGallery = read('src/ui/ui-chat-gallery.js');
requireText(chatGallery, /\(!isBulkShareMode \|\| !isMobile\) && renderVisitFilterToggleMobile\(\)/, 'gallery must hide 전체|일자 only on mobile edit; PC keeps the tabs');
requireText(chatGallery, /getListEditTextBtnStyle/, 'gallery edit text actions must use the shared compact padding helper');
if (/padding: isMobile \? '0 6px'/.test(chatGallery)) failures.push('gallery text actions must not use 6px mobile padding that makes 취소 taller than wide');
requireText(picker, /\(!isMemoryListEditMode \|\| !isMobile\) && renderMemoryAllDateToggle\(\)/, 'memories must hide 전체|일자 only on mobile edit');
requireText(picker, /getListEditTextBtnStyle/, 'memories 취소 must use shared compact padding');
const placesView = read('src/ui/ui-places.js');
requireText(placesView, /places-list-toolbar/, 'places list toolbar (전체|방문|예정 + 추가/편집) missing');
requireText(placesView, /\(!isBulkShareMode \|\| !isMobile\) && renderPlacesVisitFilter\(\)/, 'places must hide 전체|방문|예정 only on mobile edit');
requireText(placesView, /getListEditTextBtnStyle/, 'places 취소/붙여넣기/일괄공유 must use shared compact padding');
if (/visit-filter-toggle-desktop/.test(placesView)) failures.push('places visit filter must not stay in the header');
requireText(picker, /btn btn-action btn-action-dark[\s\S]{0,400}추억에 추가/, 'memory-add backdrop must use the black plus icon button');
requireText(picker, /flexDirection: 'column', gap: '6px'/, 'memory-add backdrop list spacing must stay compact');
const chatFiles = read('src/ui/ui-chat-files.js');
if (/minWidth: ["']28px["']/.test(chatFiles)) failures.push('PDF zoom controls must not be narrower than their height');
requireText(chatFiles, /minWidth: "32px", padding: "0 8px"/, 'PDF zoom +/- buttons must be at least square');

requireText(picker, /export function ParticipantBackdrop/, 'participant backdrop module missing');
requireText(picker, /SimpleBottomSheetPicker: SimpleBottomSheetPicker/, 'shared picker must be registered');
requireText(confirm, /height: '44px'[\s\S]*minHeight: '44px'/, 'confirm actions must use 44px targets');
if (/window\.confirm\s*\(/.test(sideMenu)) failures.push('settings must not use native window.confirm');
if (/\balert\s*\(/.test(uiSources)) failures.push('shared UI flows must use toast/dialog primitives instead of native alert');
if (/"stroke-(?:width|linecap|linejoin)"\s*:/.test(allUiSources)) failures.push('React SVG props must use strokeWidth/strokeLinecap/strokeLinejoin');

requireText(shared, /export function EditSelectCheckbox/, 'shared edit checkbox module missing');
requireText(shared, /top: '8px',\s*left: '8px',\s*width: '20px',\s*height: '20px',\s*borderRadius: '5px'/, 'edit checkbox spec must be 8px inset, 20×20, radius 5');
requireText(shared, /export function getListEditActionWrapStyle/, 'shared list edit action wrap missing');
requireText(shared, /export function getListEditTextBtnStyle/, 'shared list edit text button style missing');
requireText(shared, /width: isEdit && isMobile \? '100%' : 'auto'/, 'PC edit actions must stay content-sized, not 50% of the browser');
requireText(shared, /padding: isMobile \? '0 8px' : '0 14px'/, 'edit text buttons use 8px/14px padding so 320px stays one row');
if (/width: isEdit \? \(isMobile \? '100%' : '50%'\)/.test(shared)) failures.push('PC edit actions must not use 50% browser width');
requireText(shared, /marginLeft: 'auto'/, 'edit actions stay right-aligned');
requireText(shared, /export const LIST_TOOLBAR_ROW_STYLE/, 'shared list toolbar style missing');
requireText(shared, /padding: '12px 0 4px'/, 'list toolbar padding must be 12px 0 4px');
requireText(shared, /export const PAGE_HEADER_ICON_BTN_STYLE/, 'page header icon button token missing');
requireText(shared, /export const PAGE_HEADER_BACK_BTN_STYLE/, 'page header back button token missing');
requireText(shared, /export const PAGE_HEADER_ACTIONS_WRAP_STYLE/, 'page header actions wrap token missing');
requireText(shared, /export const PAGE_HEADER_TITLE_STYLE/, 'page header title token missing');
requireText(icons, /function ThreeLinesIcon\(\{ size = 22 \}/, 'ThreeLinesIcon default size must be 22 to match 보관함');
requireText(picker, /value: 'memories', label: '추억', badge: travelMemoryGroups\.length/, 'history 추억 tab must show a count badge');
requireText(picker, /value: 'people', label: '인물', badge: personTagChips\.length/, 'history 인물 tab must show a count badge');
requireText(picker, /value: 'meetings', label: '지난모임', badge: confirmedDates\.length/, 'history 지난모임 tab must show a count badge');
requireText(picker, /historyScrollPadTop/, 'memories scroll must use measured header height like gallery');
requireText(placesView, /padding: '12px 16px 4px'/, 'places toolbar must widen top and tighten bottom (12/16/4)');
requireText(placesView, /padding: '8px 16px 16px'/, 'places list body padding must stay compact under the toolbar');
requireText(chatGallery, /PAGE_HEADER_ACTIONS_WRAP_STYLE/, 'gallery page header must use shared header actions wrap');
requireText(placesView, /PAGE_HEADER_BACK_BTN_STYLE/, 'places header must use shared back button');
requireText(picker, /PAGE_HEADER_TITLE_STYLE/, '보관함/컨텐츠 header must use shared title token');
requireText(memoView, /PAGE_HEADER_ACTIONS_WRAP_STYLE/, 'memo header must use shared header actions wrap');
requireText(memoView, /ThreeLinesIcon, \{ size: 22 \}/, 'memo menu icon must be size 22');
requireText(chatRoom, /PAGE_HEADER_ACTIONS_WRAP_STYLE/, 'chat header must use shared header actions wrap');
requireText(eventModals, /PAGE_HEADER_ICON_BTN_STYLE/, 'settlement header must use shared icon button token');
requireText(eventModals, /ThreeLinesIcon, \{ size: 22 \}/, 'settlement menu icon must be size 22');
if (/SearchIcon, \{ size: 19 \}/.test(eventModals)) failures.push('settlement search icon must be size 20, not 19');
if (/top:\s*['"]4px['"]\s*,\s*left:\s*['"]4px['"]\s*,\s*width:\s*['"]20px['"]/.test(allUiSources)) {
  failures.push('edit checkboxes must be 8px inset, not 4px');
}
if (/top:\s*['"]6px['"]\s*,\s*left:\s*['"]6px['"][\s\S]{0,120}width:\s*['"]22px['"]/.test(allUiSources)) {
  failures.push('memory group checkboxes must use 8px/20px, not 6px/22px');
}
if (/top:\s*['"]12px['"]\s*,\s*left:\s*['"]10px['"]/.test(placesView)) {
  failures.push('places edit checkbox must use 8px inset, not 12/10');
}

// Admin dashboard is now in design-system.md's scope (docs/design-system.md, 2026-09-12) --
// app-admin-restore.js lives in src/core so it isn't covered by allUiSources' src/ui sweep above,
// and the native-dialog ban is worth asserting directly against admin rather than relying on it
// falling out of some other file's check.
if (/window\.confirm\s*\(|window\.prompt\s*\(/.test(adminSources)) failures.push('admin must not use native window.confirm/prompt');
requireText(adminDashboard, /ConfirmDialog/, 'admin dashboard must keep using the shared ConfirmDialog instead of native confirm');

const pkg = JSON.parse(read('package.json'));
const maplibreRange = String(pkg.dependencies?.['maplibre-gl'] || '');
const leafletBridgeRange = String(pkg.dependencies?.['@maplibre/maplibre-gl-leaflet'] || '');
if (!/^[\^~]?6\.(?:[4-9]\.|[1-9]\d)/.test(maplibreRange)) {
  failures.push('maplibre-gl must be 6.4.1+ (GHSA-jrc7-96c5-q579 / CVE-2026-85061); got ' + maplibreRange);
}
if (!/^[\^~]?0\.1\.(?:[4-9]|\d{2,})/.test(leafletBridgeRange)) {
  failures.push('@maplibre/maplibre-gl-leaflet must be 0.1.4+ for MapLibre 6; got ' + leafletBridgeRange);
}
// Map loader helpers moved to app-place-map.js in U6 (split-units).
const placeMap = read('src/core/app-place-map.js');
requireText(placeMap, /import\('@maplibre\/maplibre-gl-leaflet'\)/, 'places map must load the MapLibre Leaflet ESM bridge');
requireText(placeMap, /setWorkerUrl/, 'MapLibre 6 worker URL must be wired for Vite');

if (failures.length) {
  failures.forEach(message => console.error('[check-design-system]', message));
  process.exit(1);
}
console.log('[check-design-system] shared modules, mobile sizing, and confirmation guards OK');
