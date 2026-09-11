/**
 * U1a of docs/app-main-split-units.md: the ~56 icon components living at the bottom of
 * app-main.js were never real components -- each one was an identical 4-line pass-through to
 * `window.GATHER_UI_COMPONENTS.<Name>` (the actual SVG lives in src/ui/ui-icons.js and is
 * registered onto that global). Factored into one table-driven helper instead of 56 near-copies.
 *
 * app-main.js keeps a same-name alias for every one of these (`const { MenuIcon, ... } =
 * bindUiComponentAliases(React)`), which is required: scripts/check-required-symbols.mjs and
 * every JSX call site in app-main.js still reference these names directly.
 */

// Small line-icon set for the main header's menu bar, weather badges, admin/settlement icons,
// and the place-category marker (Tabler-style outline icons, matching src/ui/ui-icons.js).
// getWeatherIcon and UnderlineTabs are NOT in this list -- they aren't simple pass-throughs
// (getWeatherIcon picks a component by weather code; UnderlineTabs falls back to
// GATHER_APP_UTILS, not just GATHER_UI_COMPONENTS) and stay defined directly in app-main.js.
const ICON_COMPONENT_NAMES = Object.freeze([
  'MenuIcon', 'NotepadTextIcon', 'ChatSectionIcon', 'LinkIcon', 'MessageCommentIcon',
  'PencilIcon', 'BuildingIcon', 'BackArrowIcon', 'SunIcon', 'CloudIcon', 'MistIcon',
  'CloudRainIcon', 'SnowflakeIcon', 'CloudLightningIcon', 'SettingsIcon', 'MapCogIcon',
  'GiftIcon', 'MoonStarsIcon', 'TextResizeIcon', 'BellIcon', 'SearchIcon',
  'CalendarCheckIcon', 'LockIcon', 'LogoutIcon', 'RefreshIcon', 'AdminFilledMenuIcon',
  'EmojiPickerIcon', 'ExternalLinkIcon', 'WalletIcon', 'CoinIcon', 'BanknoteArrowUpIcon',
  'BanknoteArrowDownIcon', 'PiggyBankIcon', 'ChartBarIcon', 'ChartPieIcon',
  'CalendarCogIcon', 'CalendarSearchIcon', 'TrophyIcon', 'PodiumIcon',
  'CloudDataConnectionIcon', 'LogIcon', 'HourglassIcon', 'AlertTriangleIcon',
  'ShieldCheckIcon', 'KakaoTalkIcon', 'CalendarExportIcon', 'GalleryIcon',
  'PollSectionIcon', 'LineHeightIcon', 'MegaphoneIcon', 'SmallXIcon', 'PlaceSectionIcon',
  'ThreeLinesIcon', 'PlaceCategoryMarkerIcon', 'CctvIcon', 'DicesIcon'
]);

export function bindUiComponentAliases(React) {
  const out = {};
  ICON_COMPONENT_NAMES.forEach(name => {
    out[name] = function IconAlias(props) {
      const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS[name];
      return typeof C === 'function' ? React.createElement(C, props) : null;
    };
  });
  return out;
}

export { ICON_COMPONENT_NAMES };
