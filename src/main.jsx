// P6 Vite entry — core + UI leaves (live still uses index.html + assets/)
import { GATHER_APP_CONSTANTS } from './core/app-constants.js';
import { GATHER_APP_CONFIG } from './core/app-config.js';
import { GATHER_APP_CALENDAR_DATA } from './core/app-calendar-data.js';
import { GATHER_APP_CHAT_DATA } from './core/app-chat-data.js';
import { GATHER_APP_UTILS } from './core/app-utils.js';
import { GATHER_APP_NOTIFICATIONS } from './core/app-notifications.js';
import { GATHER_FIREBASE_SERVICES } from './core/firebase-services.js';
import { ConfirmDialog } from './ui/ui-confirm-dialog.js';
import { ShareModal } from './ui/ui-share-modal.js';
import {
  ImageUploadOverlay,
  ImageProcessingOverlay,
  EmojiGridButton,
  EmojiPickerSheet
} from './ui/ui-overlays.js';
import {
  SearchResultLogRow,
  TikTokEmbedWidget,
  UrlCapsuleBadge,
  ParticipantPickerButton,
  DateCapsuleBadge
} from './ui/ui-widgets.js';
import {
  ChatParticipantSheet,
  NotificationPermissionHelpModal
} from './ui/ui-chat-sheets.js';
import { UserManualOverlay } from './ui/ui-user-manual.js';
import { WeatherBadge, WeatherLocationModal } from './ui/ui-weather.js';
import { SharedSideMenuSettings, MainSideMenu } from './ui/ui-side-menu.js';
import {
  UpdateAvailableBanner,
  ImageShareViewer,
  ImageThumbRemoveButton,
  InlineSearchBar,
  MemoShareModal,
  ChatSideMenu
} from './ui/ui-misc.js';
import { PlaceRegisterModal } from './ui/ui-place-register.js';
import { LightboxInfoPanel, Lightbox } from './ui/ui-lightbox.js';
import { ChatGalleryModal } from './ui/ui-chat-gallery.js';
import {
  DirectChatMediaText,
  DeadlineDateTimePicker,
  PlacesSection,
  ImageUrlModal
} from './ui/ui-remaining.js';
import {
  SectionCountBadge,
  SectionToggleButton,
  SearchCategoryTabs,
  SimpleBottomSheetPicker,
  PhotoGallery,
  SummaryList
} from './ui/ui-summary-gallery.js';
import {
  ResizableModalContainer,
  AutoGrowTextarea,
  FormAddEditActionButtons,
  SegmentedToggle,
  ItemEditDeleteActions,
  GamifiedConfirmButtonContent,
  LinkPreviewCard,
  LinkPreviewProgressOverlay,
  DeleteConfirmModal,
  AdminLoginGate,
  DonutChart,
  ColorSwatchPicker,
  StickyVideoBox,
  PollVoterSheet,
  OperationProgressOverlay,
  ToggleSwitch,
  Footer
} from './ui/ui-shared.js';
import * as UiIcons from './ui/ui-icons.js';
import { PlaceMapView, PlacesView } from './ui/ui-places.js';
import { MemoView } from './ui/ui-memo-view.js';
import { ChatRoomView } from './ui/ui-chat-room.js';
import { DateModal } from './ui/ui-date-modal.js';
import { AnniversaryModal, SettlementSummaryModal, PollModal } from './ui/ui-event-modals.js';
import {
  CalendarGrid,
  CommentsSection,
  MemoCard,
  PollList,
  GlobalSearchModal,
  EditMessageModal
} from './ui/ui-calendar-core.js';

console.log('[P6] Vite entry loaded', {
  constants: !!GATHER_APP_CONSTANTS,
  config: !!GATHER_APP_CONFIG,
  MainSideMenu: typeof MainSideMenu,
  iconCount: Object.keys(UiIcons).length,
  PlacesView: typeof PlacesView,
  MemoView: typeof MemoView,
  ChatRoomView: typeof ChatRoomView,
  DateModal: typeof DateModal,
  AnniversaryModal: typeof AnniversaryModal,
  CalendarGrid: typeof CalendarGrid,
  publicCalendarIds: GATHER_APP_CONFIG.PUBLIC_CALENDAR_IDS
});
