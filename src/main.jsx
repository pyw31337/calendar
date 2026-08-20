// P6 Vite entry — core modules (live still uses index.html + assets/)
import { GATHER_APP_CONSTANTS } from './core/app-constants.js';
import { GATHER_APP_CONFIG } from './core/app-config.js';
import { GATHER_APP_CALENDAR_DATA } from './core/app-calendar-data.js';
import { GATHER_APP_CHAT_DATA } from './core/app-chat-data.js';
import { GATHER_APP_UTILS } from './core/app-utils.js';
import { GATHER_APP_NOTIFICATIONS } from './core/app-notifications.js';
import { GATHER_FIREBASE_SERVICES } from './core/firebase-services.js';

console.log('[P6] Vite entry loaded with core modules', {
  constants: !!GATHER_APP_CONSTANTS,
  config: !!GATHER_APP_CONFIG,
  calendarData: !!GATHER_APP_CALENDAR_DATA,
  chatData: !!GATHER_APP_CHAT_DATA,
  utils: !!GATHER_APP_UTILS,
  notifications: !!GATHER_APP_NOTIFICATIONS,
  firebaseServices: !!GATHER_FIREBASE_SERVICES,
  publicCalendarIds: GATHER_APP_CONFIG.PUBLIC_CALENDAR_IDS
});
