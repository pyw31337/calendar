/**
 * Text-field shape by line count (V2 design rule):
 *   one line  -> capsule (fully rounded ends, same top/bottom padding)
 *   2+ lines  -> rounded box, tall enough for the whole placeholder with even padding
 *
 * A single-line <input> is always a capsule (CSS alone). A <textarea> can be either: an empty
 * one is as tall as its placeholder needs, a filled one as tall as its text (the app's
 * AutoGrowTextarea already grows it). This writes data-field-lines on every textarea so the
 * stylesheet can pick the shape, and a min-height so a wrapped placeholder is never clipped.
 */

const MEASURE_FONT_FALLBACK = '16px sans-serif';

export function countPlaceholderLines(text, contentWidth, measureWidth) {
  if (!text || !(contentWidth > 0)) return 1;
  return String(text).split(/\r?\n/).reduce((total, line) => {
    const width = measureWidth(line);
    return total + Math.max(1, Math.ceil(width / contentWidth - 0.02));
  }, 0);
}

export function installFieldShape(doc = typeof document !== 'undefined' ? document : null, {
  isEnabled = () => true,
} = {}) {
  if (!doc || !doc.body) return () => {};
  const view = doc.defaultView;
  if (!view || typeof view.getComputedStyle !== 'function') return () => {};
  let canvas = null;
  const measure = (font) => {
    if (!canvas) canvas = doc.createElement('canvas');
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return () => 0;
    ctx.font = font || MEASURE_FONT_FALLBACK;
    return text => ctx.measureText(text).width;
  };

  const apply = (el) => {
    if (!el || el.tagName !== 'TEXTAREA' || !el.isConnected) return;
    const cs = view.getComputedStyle(el);
    const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const borderY = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
    const fontSize = parseFloat(cs.fontSize) || 16;
    const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.4;
    const contentWidth = el.clientWidth - padX;
    let lines;
    if (el.value) {
      lines = Math.max(1, Math.round((el.scrollHeight - padY) / lineHeight));
    } else {
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      lines = countPlaceholderLines(el.placeholder, contentWidth, measure(font));
    }
    // The shape follows the box actually drawn: a rows=2 field with a one-line placeholder is
    // still a two-line box, not a stretched capsule.
    const renderedLines = Math.max(1, Math.round((el.clientHeight - padY) / lineHeight));
    const next = Math.max(lines, renderedLines) <= 1 ? '1' : 'multi';
    if (el.getAttribute('data-field-lines') !== next) el.setAttribute('data-field-lines', next);
    // Never clip a wrapped placeholder; a filled textarea keeps whatever its own grow logic set.
    const need = el.value ? 0 : Math.ceil(lines * lineHeight + padY + borderY);
    const current = el.style.getPropertyValue('--field-min-h');
    const value = need > 0 && lines > 1 ? `${need}px` : '';
    if (current !== value) {
      if (value) el.style.setProperty('--field-min-h', value);
      else el.style.removeProperty('--field-min-h');
    }
  };

  const applyAll = () => {
    if (!isEnabled()) return;
    doc.querySelectorAll('textarea').forEach(apply);
  };

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    const run = () => { scheduled = false; applyAll(); };
    if (typeof view.requestAnimationFrame === 'function') view.requestAnimationFrame(run);
    else setTimeout(run, 16);
  };

  const onInput = (event) => {
    if (event.target && event.target.tagName === 'TEXTAREA' && isEnabled()) apply(event.target);
  };
  doc.addEventListener('input', onInput, true);
  view.addEventListener('resize', schedule);
  const observer = typeof MutationObserver !== 'undefined'
    ? new MutationObserver(mutations => {
      if (mutations.some(m => [...m.addedNodes].some(n => n.nodeType === 1 && (n.tagName === 'TEXTAREA' || (n.querySelector && n.querySelector('textarea')))))) schedule();
    })
    : null;
  if (observer) observer.observe(doc.body, { childList: true, subtree: true });
  schedule();

  return () => {
    doc.removeEventListener('input', onInput, true);
    view.removeEventListener('resize', schedule);
    if (observer) observer.disconnect();
  };
}
