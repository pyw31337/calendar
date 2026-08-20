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
