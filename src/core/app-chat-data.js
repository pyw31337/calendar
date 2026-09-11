import { getLocalStorage } from './app-calendar-screen-state.js';

const HEIC_TO_CDN_URLS = Object.freeze([
    'https://cdn.jsdelivr.net/npm/heic-to@1.5.2/dist/heic-to.js',
    'https://unpkg.com/heic-to@1.5.2/dist/heic-to.js'
  ]);

  const HEIC2ANY_CDN_URLS = Object.freeze([
    'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js',
    'https://unpkg.com/heic2any@0.0.4/dist/heic2any.min.js'
  ]);

  const EMOJI_CATEGORIES = Object.freeze([
    Object.freeze({ label: '표정', emojis: Object.freeze(['😀', '😁', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😢', '😭', '😤', '😡', '🥺', '😱', '😨', '😴', '🤔', '🙄', '😅', '😐', '🤗', '🤭']) }),
    Object.freeze({ label: '손동작·사람', emojis: Object.freeze(['👍', '👎', '👏', '🙌', '🙏', '👋', '🤝', '💪', '✌️', '🤞', '👌', '🤙', '👊', '🤟', '🖐️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤷']) }),
    Object.freeze({ label: '하트', emojis: Object.freeze(['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖', '💗', '💘', '💝', '😻']) }),
    Object.freeze({ label: '동물·자연', emojis: Object.freeze(['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐷', '🐸', '🐵', '🌸', '🌼', '🌻', '🌈', '⭐', '☀️', '☁️', '❄️']) }),
    Object.freeze({ label: '음식', emojis: Object.freeze(['🍎', '🍕', '🍔', '🍟', '🍗', '🍺', '🍻', '☕', '🍰', '🎂', '🍫', '🍭', '🍜', '🍱', '🍚', '🥗']) }),
    Object.freeze({ label: '활동·사물', emojis: Object.freeze(['🎉', '🎊', '🎁', '🎈', '🎵', '🎶', '⚽', '📷', '📱', '💻', '⏰', '🔥', '💤', '💯', '✅', '❌', '⚠️', '📌', '📍', '🚗']) }),
    Object.freeze({ label: '기호', emojis: Object.freeze(['✨', '💥', '💫', '💦', '💨', '🆗', '🆒', '🔔', '🚫', '❓', '❗', '➕', '➖']) })
  ]);

  export const GATHER_APP_CHAT_DATA = Object.freeze({
    PEEKALINK_FREE_HOURLY_LIMIT: 50,
    PEEKALINK_HOUR_BUCKET_MS: 3600000,
    HEIC_TO_CDN_URLS,
    HEIC2ANY_CDN_URLS,
    TWEMOJI_CDN_BASE: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/',
    EMOJI_CATEGORIES,
    RECENT_EMOJI_STORAGE_KEY: 'gather_recent_emojis_v1'
  });

if (typeof window !== 'undefined') {
  window.GATHER_APP_CHAT_DATA = GATHER_APP_CHAT_DATA;
}

// A curated, cross-platform-consistent emoji set (Twemoji, the same flat-design set used by
// Twitter/X, Discord, and Slack) rendered as small <img> tags -- not native OS emoji fonts.
// Native emoji rendering looks different on every OS (Apple/Segoe/Noto/etc.), which is exactly
// what a shared group chat wants to avoid: everyone sees the identical glyph regardless of
// device or browser (Safari/Chrome/Edge/Firefox, desktop or mobile).
function twemojiCodepoint(emoji) {
  const hasZwj = emoji.indexOf('\u200D') !== -1;
  const codepoints = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp === 0xFE0F && !hasZwj) continue; // strip the variation selector unless a ZWJ sequence needs it, matching Twemoji's own asset naming
    codepoints.push(cp.toString(16));
  }
  return codepoints.join('-');
}
export function twemojiImageUrl(emoji) {
  return `${GATHER_APP_CHAT_DATA.TWEMOJI_CDN_BASE}${twemojiCodepoint(emoji)}.svg`;
}

export function getRecentEmojis() {
  try {
    const arr = JSON.parse(getLocalStorage().getItem(GATHER_APP_CHAT_DATA.RECENT_EMOJI_STORAGE_KEY) || '[]');
    return Array.isArray(arr) ? arr.slice(0, 24) : [];
  } catch (e) {
    return [];
  }
}
export function addRecentEmoji(emoji) {
  try {
    const next = [emoji, ...getRecentEmojis().filter(e => e !== emoji)].slice(0, 24);
    getLocalStorage().setItem(GATHER_APP_CHAT_DATA.RECENT_EMOJI_STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    // storage unavailable (private browsing etc.) -- recents just won't persist
  }
}
