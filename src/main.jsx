// P6 Vite entry — data + utils modules (live still uses index.html + assets/)
import { GATHER_APP_CONSTANTS } from './core/app-constants.js';
import { GATHER_APP_CONFIG } from './core/app-config.js';
import { GATHER_APP_CALENDAR_DATA } from './core/app-calendar-data.js';
import { GATHER_APP_CHAT_DATA } from './core/app-chat-data.js';
import { GATHER_APP_UTILS } from './core/app-utils.js';

console.log('[P6] Vite entry loaded with data+utils modules', {
  constants: !!GATHER_APP_CONSTANTS,
  config: !!GATHER_APP_CONFIG,
  calendarData: !!GATHER_APP_CALENDAR_DATA,
  chatData: !!GATHER_APP_CHAT_DATA,
  utils: !!GATHER_APP_UTILS,
  publicCalendarIds: GATHER_APP_CONFIG.PUBLIC_CALENDAR_IDS
});
