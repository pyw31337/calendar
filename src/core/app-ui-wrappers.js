/**
 * docs/app-main-split-units.md units U1a/U1b: many components at the top and bottom of
 * app-main.js were never real components -- each one was a near-identical few-line pass-through
 * to `window.GATHER_UI_COMPONENTS.<Name>` (the real body lives in src/ui/*.js and is registered
 * onto that global). Factored into one table-driven helper instead of dozens of near-copies.
 *
 * app-main.js keeps a same-name alias for every one of these (`const { MenuIcon, ... } =
 * bindUiComponentAliases(React)`), which is required: scripts/check-required-symbols.mjs and
 * every JSX call site in app-main.js still reference these names directly.
 */

// U1a: small line-icon set for the main header's menu bar, weather badges, admin/settlement
// icons, and the place-category marker (Tabler-style outline icons, matching src/ui/ui-icons.js).
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

// U1b: top-of-file component wrappers (modals, badges, admin dialogs) that follow the exact
// same plain pass-through shape as the icons above, just not icons.
const PLAIN_WRAPPER_COMPONENT_NAMES = Object.freeze([
  'ResizableModalContainer', 'AutoGrowTextarea', 'FormAddEditActionButtons', 'SegmentedToggle',
  'ItemEditDeleteActions', 'GamifiedConfirmButtonContent', 'LinkPreviewCard',
  'LinkPreviewProgressOverlay', 'AdminLoginGate', 'DonutChart', 'ColorSwatchPicker',
  'StickyVideoBox', 'PollVoterSheet', 'OperationProgressOverlay', 'ToggleSwitch', 'Footer',
  'SearchResultLogRow', 'TikTokEmbedWidget', 'UrlCapsuleBadge', 'ParticipantPickerButton',
  'DateCapsuleBadge', 'CapsuleTextBadge', 'AdminDashboard', 'AdminModal',
  'AdminUnifiedSearchResultsView', 'AdminCreateCalendarModal', 'AdminRestorePhraseModal',
  'AdminUnifiedSearchModal'
]);

// U1c: bottom-of-file view/modal wrappers, interspersed among real logic (image pipeline, link
// preview, chat render helpers, hooks, search, weather, map) that U1c leaves alone for later
// units. Includes required-symbols names (AdminLoginGate is in U1b; PlacesView, DateModal,
// ChatGalleryModal, PhotoGallery, SummaryList are here) -- their aliases must keep these exact
// names. AppSettingsModal/NotificationOnboardingModal previously used `C ? ... : null` instead of
// `typeof C === 'function' ? ... : null`; behaviorally identical since C only ever holds
// undefined or a function from these registries, normalized to the shared shape here.
const VIEW_WRAPPER_COMPONENT_NAMES = Object.freeze([
  'CalendarGrid', 'CommentsSection', 'MemoCard', 'PollList', 'GlobalSearchModal',
  'EditMessageModal', 'DirectChatMediaText', 'DeadlineDateTimePicker', 'PlacesSection',
  'ImageUrlModal', 'ImageUploadOverlay', 'ImageProcessingOverlay', 'EmojiPickerSheet',
  'Lightbox', 'ChatRoomView', 'ChatParticipantSheet', 'AppSettingsModal',
  'NotificationOnboardingModal', 'NotificationPermissionHelpModal', 'ConfirmDialog',
  'DateModal', 'SectionCountBadge', 'SectionToggleButton', 'SearchCategoryTabs',
  'SimpleBottomSheetPicker', 'PhotoGallery', 'SummaryList', 'MemoPreviewSection',
  'ShareModal', 'UserManualOverlay', 'WeatherBadge', 'WeatherLocationModal', 'MainSideMenu',
  'UpdateAvailableBanner', 'ImageShareViewer', 'ImageThumbRemoveButton', 'InlineSearchBar',
  'MemoShareModal', 'ChatGalleryModal', 'MemoView', 'AnniversaryModal',
  'SettlementSummaryModal', 'PollModal', 'PlaceMapView', 'PlacesView', 'HistoryView',
  'ContentView', 'PlaceRegisterModal'
]);

// getWeatherIcon (picks a component by weather code) is not a plain pass-through and stays
// defined directly in app-main.js.
//
// UnderlineTabs and CreateSettlementModal are ALSO not plain pass-throughs -- each checks an
// extra source before falling back to GATHER_UI_COMPONENTS (GATHER_APP_UTILS.UnderlineTabs, and
// the CreateSettlementModal-specific window.__GATHER_CREATE_SETTLEMENT_MODAL__ override) -- so
// they get their own resolver here instead of the shared plain-pass-through factory.
function createSpecialAliases(React) {
  return {
    UnderlineTabs(props) {
      const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.UnderlineTabs;
      if (C) return React.createElement(C, props);
      const f = window.GATHER_APP_UTILS && window.GATHER_APP_UTILS.UnderlineTabs;
      return typeof f === 'function' ? f(props) : null;
    },
    CreateSettlementModal(props) {
      const C = window.__GATHER_CREATE_SETTLEMENT_MODAL__
        || (window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS.CreateSettlementModal);
      return typeof C === 'function' ? React.createElement(C, props) : null;
    }
  };
}

export function bindUiComponentAliases(React) {
  const out = createSpecialAliases(React);
  [...ICON_COMPONENT_NAMES, ...PLAIN_WRAPPER_COMPONENT_NAMES, ...VIEW_WRAPPER_COMPONENT_NAMES].forEach(name => {
    out[name] = function PassThroughAlias(props) {
      const C = window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS[name];
      return typeof C === 'function' ? React.createElement(C, props) : null;
    };
  });
  return out;
}

export { ICON_COMPONENT_NAMES, PLAIN_WRAPPER_COMPONENT_NAMES, VIEW_WRAPPER_COMPONENT_NAMES };
