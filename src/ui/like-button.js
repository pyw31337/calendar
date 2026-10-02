/**
 * 좋아요 heart button, shared by every screen. The icon is always the filled Tabler heart; it is
 * gray (or a soft white on top of a photo) until liked, then the theme's brand color.
 *
 *   h(LikeButton, { calendarId, item: { kind, ref, title, subtitle, thumb, url, target } })
 *
 * variant 'onMedia' sits on a thumbnail (absolutely positioned by the caller's className/style);
 * 'plain' sits in a card's action row next to other icon buttons.
 */
import { useLikes } from '../core/likes-store.js';

const HEART_PATH = 'M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z';

const HEART_OUTLINE_PATH = 'M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572';

export function HeartIcon({ size = 18, outline = false }) {
  const React = window.React;
  if (outline) {
    return React.createElement('svg', {
      xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24',
      fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
      'aria-hidden': 'true', style: { display: 'block' }
    }, React.createElement('path', { d: HEART_OUTLINE_PATH }));
  }
  return React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24',
    fill: 'currentColor', 'aria-hidden': 'true', style: { display: 'block' }
  }, React.createElement('path', { d: HEART_PATH }));
}

// Hearts drawn over a photo/poster/dark card: no chip behind them. White outline until liked,
// then the filled heart in the brand color.
const MEDIA_VARIANTS = new Set(['onMedia', 'inlineMedia']);

// `as: 'span'` renders a role="button" span for hearts that sit inside another <button> (a card
// that opens on click) — nested <button>s are invalid HTML and break taps in Safari.
export function LikeButton({ calendarId, item, variant = 'plain', size, className = '', style = null, as = 'button' }) {
  const React = window.React;
  const likes = useLikes(React, calendarId);
  const [busy, setBusy] = React.useState(false);
  if (!item || !item.kind || !item.ref) return null;
  const liked = likes.isLiked(item.kind, item.ref);
  const onMedia = MEDIA_VARIANTS.has(variant);
  const iconSize = size || (onMedia ? 16 : 18);
  const onClick = async event => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    try { await likes.toggle(item); } finally { setBusy(false); }
  };
  const asSpan = as === 'span';
  return React.createElement(asSpan ? 'span' : 'button', {
    ...(asSpan
      ? { role: 'button', tabIndex: 0, onKeyDown: event => { if (event.key === 'Enter' || event.key === ' ') onClick(event); } }
      : { type: 'button' }),
    className: `gather-like-btn is-${variant}${liked ? ' is-liked' : ''}${className ? ` ${className}` : ''}`,
    'aria-pressed': liked ? 'true' : 'false',
    'aria-label': liked ? '좋아요 취소' : '좋아요',
    title: liked ? '좋아요 취소' : '좋아요',
    onClick,
    onPointerDown: event => event.stopPropagation(),
    style: style || undefined
  }, React.createElement(HeartIcon, { size: iconSize, outline: onMedia && !liked }));
}
