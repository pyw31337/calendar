/**
 * Late-bound UI aliases used by the composition root and the V2 shell.
 *
 * Feature files still register their public components on GATHER_UI_COMPONENTS for legacy
 * compatibility, but this bridge loads the owning chunk only when React first needs it. That
 * keeps archive/gallery/admin code out of calendar startup without changing the old contract.
 */

const iconNames = [
  'MenuIcon', 'NotepadTextIcon', 'ChatSectionIcon', 'LinkIcon', 'MessageCommentIcon', 'PencilIcon',
  'BuildingIcon', 'BackArrowIcon', 'SunIcon', 'CloudIcon', 'MistIcon', 'CloudRainIcon',
  'SnowflakeIcon', 'CloudLightningIcon', 'SettingsIcon', 'MapCogIcon', 'GiftIcon', 'MoonStarsIcon',
  'TextResizeIcon', 'BellIcon', 'SearchIcon', 'CalendarCheckIcon', 'LockIcon', 'LogoutIcon',
  'RefreshIcon', 'AdminFilledMenuIcon', 'EmojiPickerIcon', 'ExternalLinkIcon', 'WalletIcon',
  'CoinIcon', 'BanknoteArrowUpIcon', 'BanknoteArrowDownIcon', 'PiggyBankIcon', 'ChartBarIcon',
  'ChartPieIcon', 'CalendarCogIcon', 'CalendarSearchIcon', 'TrophyIcon', 'PodiumIcon',
  'CloudDataConnectionIcon', 'LogIcon', 'HourglassIcon', 'AlertTriangleIcon', 'ShieldCheckIcon',
  'KakaoTalkIcon', 'CalendarExportIcon', 'GalleryIcon', 'PollSectionIcon', 'LineHeightIcon',
  'MegaphoneIcon', 'SmallXIcon', 'PlaceSectionIcon', 'ThreeLinesIcon', 'PlaceCategoryMarkerIcon',
  'CctvIcon', 'DicesIcon'
];

const loadersByComponent = new Map();
function register(names, loader) {
  names.forEach(name => loadersByComponent.set(name, loader));
}

register(iconNames, () => import('./ui-icons.js'));
register(['ConfirmDialog'], () => import('./ui-confirm-dialog.js'));
register(['ShareModal'], () => import('./ui-share-modal.js'));
register(['AppErrorBoundary', 'ImageUploadOverlay', 'ImageProcessingOverlay', 'EmojiPickerSheet'], () => import('./ui-overlays.js'));
register(['SearchResultLogRow', 'TikTokEmbedWidget', 'UrlCapsuleBadge', 'CapsuleTextBadge', 'ParticipantPickerButton', 'DateCapsuleBadge'], () => import('./ui-widgets.js'));
register(['WeatherBadge', 'WeatherLocationModal', 'DailyWeatherIcon', 'WeatherDetailModal', 'WeatherLocationSettingModal'], () => import('./ui-weather.js'));
register(['AppSettingsModal', 'NotificationOnboardingModal', 'MainSideMenu'], () => import('./ui-side-menu.js'));
register(['UpdateAvailableBanner', 'ImageShareViewer', 'ImageThumbRemoveButton', 'InlineSearchBar', 'MemoShareModal'], () => import('./ui-misc.js'));
register(['PlaceRegisterModal'], () => import('./ui-place-register.js'));
register(['DirectChatMediaText', 'DeadlineDateTimePicker', 'PlacesSection', 'ImageUrlModal'], () => import('./ui-remaining.js'));
register(['SharedContentPreviewModal', 'SectionCountBadge', 'SectionToggleButton', 'SearchCategoryTabs', 'SimpleBottomSheetPicker', 'ParticipantBackdrop', 'PhotoGallery', 'MemoPreviewSection', 'SummaryList', 'HistoryView', 'ContentView', 'CulturePerformancesTab', 'ContentRegisterModal', 'RegionFilterBackdrop'], () => import('./ui-summary-gallery.js'));
register(['ResizableModalContainer', 'AutoGrowTextarea', 'FormAddEditActionButtons', 'SegmentedToggle', 'ItemEditDeleteActions', 'GamifiedConfirmButtonContent', 'LinkPreviewCard', 'LinkPreviewProgressOverlay', 'AdminLoginGate', 'DonutChart', 'ColorSwatchPicker', 'StickyVideoBox', 'PollVoterSheet', 'OperationProgressOverlay', 'ToggleSwitch', 'Footer', 'MemoTagInputRow', 'ClickToPlayVideoCard', 'UnderlineTabs'], () => import('./ui-shared.js'));
register(['CalendarGrid', 'CommentsSection', 'MemoCard', 'PollList', 'GlobalSearchModal', 'EditMessageModal'], () => import('./ui-calendar-core.js'));
register(['ChatParticipantSheet', 'NotificationPermissionHelpModal'], () => import('./ui-chat-sheets.js'));
register(['ChatRoomView', 'ChatGalleryModal'], () => typeof window.__gatherLoadChatUi === 'function'
  ? window.__gatherLoadChatUi()
  : Promise.all([import('./ui-chat-sheets.js'), import('./ui-chat-gallery.js'), import('./ui-chat-files.js'), import('./ui-chat-room.js')]));
register(['MemoView'], () => typeof window.__gatherLoadViewUi === 'function' ? window.__gatherLoadViewUi('memo') : import('./ui-memo-view.js'));
register(['PlacesView', 'PlaceMapView'], () => typeof window.__gatherLoadViewUi === 'function' ? window.__gatherLoadViewUi('places') : import('./ui-places.js'));
register(['Lightbox'], () => import('./ui-lightbox.js'));
register(['DateModal'], () => import('./ui-date-modal.js'));
register(['AnniversaryModal', 'SettlementSummaryModal', 'PollModal', 'CreateSettlementModal'], () => typeof window.__gatherLoadEventUi === 'function' ? window.__gatherLoadEventUi() : import('./ui-event-modals.js'));
register(['AdminDashboard', 'AdminModal', 'AdminUnifiedSearchResultsView', 'AdminCreateCalendarModal', 'AdminRestorePhraseModal', 'AdminUnifiedSearchModal'], () => typeof window.__gatherLoadAdminUi === 'function' ? window.__gatherLoadAdminUi() : Promise.all([import('./ui-admin-modals.js'), import('./ui-admin-dashboard.js')]));

const componentLoadPromises = new Map();
function currentComponent(name) {
  return window.GATHER_UI_COMPONENTS && window.GATHER_UI_COMPONENTS[name];
}
function loadComponent(name) {
  if (typeof currentComponent(name) === 'function') return Promise.resolve();
  const loader = loadersByComponent.get(name);
  if (!loader) return Promise.resolve();
  if (!componentLoadPromises.has(name)) {
    componentLoadPromises.set(name, Promise.resolve()
      .then(loader)
      .catch(error => {
        componentLoadPromises.delete(name);
        console.error(`[ui-loader] ${name} chunk failed to load`, error);
        throw error;
      }));
  }
  return componentLoadPromises.get(name);
}

function deferredAlias(React, name, resolve = () => currentComponent(name)) {
  return function DeferredUiComponent(props) {
    const Component = resolve();
    const [, refresh] = React.useState(0);
    React.useEffect(() => {
      if (typeof Component === 'function') return undefined;
      let active = true;
      loadComponent(name).then(() => {
        if (active) refresh(value => value + 1);
      }).catch(() => {});
      return () => { active = false; };
    }, [Component]);
    return typeof Component === 'function' ? React.createElement(Component, props) : null;
  };
}

const aliasCache = new WeakMap();

export function bindUiComponentAliases(React) {
  const cached = aliasCache.get(React);
  if (cached) return cached;
  const names = [
    ...iconNames,
    'ResizableModalContainer', 'AutoGrowTextarea', 'FormAddEditActionButtons', 'SegmentedToggle',
    'ItemEditDeleteActions', 'GamifiedConfirmButtonContent', 'LinkPreviewCard', 'LinkPreviewProgressOverlay',
    'AdminLoginGate', 'DonutChart', 'ColorSwatchPicker', 'StickyVideoBox', 'PollVoterSheet',
    'OperationProgressOverlay', 'ToggleSwitch', 'Footer', 'SearchResultLogRow', 'TikTokEmbedWidget',
    'UrlCapsuleBadge', 'ParticipantPickerButton', 'DateCapsuleBadge', 'CapsuleTextBadge', 'AdminDashboard',
    'AdminModal', 'AdminUnifiedSearchResultsView', 'AdminCreateCalendarModal', 'AdminRestorePhraseModal',
    'AdminUnifiedSearchModal', 'CalendarGrid', 'CommentsSection', 'MemoCard', 'PollList', 'GlobalSearchModal',
    'EditMessageModal', 'DirectChatMediaText', 'DeadlineDateTimePicker', 'PlacesSection', 'ImageUrlModal',
    'ImageUploadOverlay', 'ImageProcessingOverlay', 'EmojiPickerSheet', 'Lightbox', 'ChatRoomView',
    'ChatParticipantSheet', 'AppSettingsModal', 'NotificationOnboardingModal', 'NotificationPermissionHelpModal',
    'ConfirmDialog', 'DateModal', 'SectionCountBadge', 'SectionToggleButton', 'SearchCategoryTabs',
    'SimpleBottomSheetPicker', 'PhotoGallery', 'SummaryList', 'MemoPreviewSection', 'ShareModal',
    'WeatherBadge', 'WeatherLocationModal', 'MainSideMenu', 'UpdateAvailableBanner', 'ImageShareViewer',
    'ImageThumbRemoveButton', 'InlineSearchBar', 'MemoShareModal', 'ChatGalleryModal', 'MemoView',
    'AnniversaryModal', 'SettlementSummaryModal', 'PollModal', 'PlaceMapView', 'PlacesView', 'HistoryView',
    'ContentView', 'PlaceRegisterModal'
  ];
  const aliases = {};
  names.forEach(name => { aliases[name] = deferredAlias(React, name); });
  aliases.UnderlineTabs = deferredAlias(React, 'UnderlineTabs', () => currentComponent('UnderlineTabs') || window.GATHER_APP_UTILS?.UnderlineTabs);
  aliases.CreateSettlementModal = deferredAlias(React, 'CreateSettlementModal', () => window.__GATHER_CREATE_SETTLEMENT_MODAL__ || currentComponent('CreateSettlementModal'));
  aliasCache.set(React, aliases);
  return aliases;
}

export { iconNames as ICON_COMPONENT_NAMES };
