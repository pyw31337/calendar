import './visual-viewport-sync.js';
/**
 * Shared ChatFull-style bubble modules for V2 chat + memo presentation.
 * Presentation only — callers keep real data/handlers.
 */
import './chat-bubble-modules.css';
import { shortParticipantName } from './view-data.js';

function h(type, props, ...children) {
  const React = window.React;
  return React.createElement(type, props, ...children);
}

/** Colored participant name pill (ChatFull `.chat-name-pill`). */
export function NameColorPill({ name, color, className = '', style, ...rest }) {
  if (!name) return null;
  return h(
    'span',
    {
      className: `v2-name-pill ${className}`.trim(),
      style: { backgroundColor: color || '#A78BFA', ...style },
      ...rest,
    },
    shortParticipantName(name)
  );
}

/** White rounded bubble surface (ChatFull message body). */
export function BubbleSurface({
  children,
  className = '',
  as = 'div',
  style,
  ...rest
}) {
  return h(
    as,
    {
      className: `v2-bubble-surface ${className}`.trim(),
      style,
      ...rest,
    },
    children
  );
}

/** Nested reply/quote block with left accent bar. */
export function ReplyQuote({ author, text, className = '', onClick, ...rest }) {
  if (!author && !text) return null;
  return h(
    'div',
    {
      className: `v2-reply-quote ${className}`.trim(),
      onClick,
      role: onClick ? 'button' : undefined,
      tabIndex: onClick ? 0 : undefined,
      ...rest,
    },
    author ? h('span', { className: 'v2-reply-quote-author' }, author) : null,
    text ? h('span', { className: 'v2-reply-quote-text' }, text) : null
  );
}

/** Timestamp / meta line under a bubble. */
export function BubbleMeta({ children, className = '', ...rest }) {
  if (children == null || children === '') return null;
  return h(
    'div',
    { className: `v2-bubble-meta ${className}`.trim(), ...rest },
    children
  );
}

/**
 * Vertical stack: name pill → bubble surface → meta.
 * Optional reply quote renders inside the bubble before `children`.
 */
export function ChatBubbleFrame({
  name,
  color,
  meta,
  quote,
  children,
  className = '',
  surfaceAs = 'div',
  surfaceClassName = '',
  surfaceProps = {},
  pillClassName = '',
  ...rest
}) {
  const { className: surfacePropClass = '', ...restSurfaceProps } = surfaceProps || {};
  return h(
    'div',
    { className: `v2-bubble-frame ${className}`.trim(), ...rest },
    h(NameColorPill, { name, color, className: pillClassName }),
    h(
      BubbleSurface,
      {
        as: surfaceAs,
        className: `${surfaceClassName} ${surfacePropClass}`.trim(),
        ...restSurfaceProps,
      },
      quote
        ? h(ReplyQuote, {
            author: quote.author,
            text: quote.text,
            onClick: quote.onClick,
          })
        : null,
      children
    ),
    h(BubbleMeta, null, meta)
  );
}

export default {
  NameColorPill,
  BubbleSurface,
  ReplyQuote,
  BubbleMeta,
  ChatBubbleFrame,
};
