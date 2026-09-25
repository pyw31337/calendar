/**
 * The only user-photo thumbnail. Gallery, archive, home, memo, and meeting grids
 * all render this so a paint fix lands everywhere at once.
 * Emoji, logos, and culture posters stay on their own <img> tags.
 */
import { resolvePhotoAsset } from '../core/gallery-thumb.js';
import { MediaThumb } from './ui-overlays.js';

export function PhotoAssetThumb({
  photo,
  alt = '',
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'no-referrer',
  draggable = false,
  onClick,
  onLoad,
  onBroken,
  isBroken,
  fill = false,
  style,
  className,
  ...rest
}) {
  const React = window.React;
  const resolved = resolvePhotoAsset(photo || {}, { isBroken });
  const assetKey = resolved.assetKey || undefined;
  const fillStyle = fill ? {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    objectFit: 'cover',
    display: 'block',
  } : null;
  const paintStyle = { ...fillStyle, ...style };

  if (resolved.state !== 'ready') {
    return React.createElement('div', {
      ...rest,
      className: ['photo-asset-thumb', 'photo-asset-fallback', className].filter(Boolean).join(' '),
      'data-asset-key': assetKey,
      role: 'img',
      'aria-label': alt || '이미지를 불러오지 못했습니다.',
      style: {
        ...paintStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: paintStyle.background || paintStyle.backgroundColor || 'var(--bg-primary, #f3f1f8)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      },
    });
  }

  return React.createElement(MediaThumb, {
    ...rest,
    className: ['photo-asset-thumb', className].filter(Boolean).join(' '),
    'data-asset-key': assetKey,
    src: resolved.displaySrc,
    fallbackSrc: resolved.fallbackSrc,
    alt,
    loading,
    decoding,
    referrerPolicy,
    draggable,
    onClick,
    onLoad,
    onBroken,
    style: paintStyle,
  });
}
