/**
 * Shared scroll-driven header hide/show hook. Was duplicated verbatim across
 * ui-summary-gallery.js, ui-chat-gallery.js, ui-event-modals.js and ui-memo-view.js --
 * consolidated here so the "scroll won't go down / snaps back up" fix (hasRoomToHide,
 * see below) only has to exist -- and get fixed -- in one place.
 */
export function useScrollHideHeader() {
  const React = window.React;
  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
  const lastScrollTopRef = React.useRef(0);
  const onScroll = React.useCallback((e) => {
    const el = e && e.target;
    const scrollTop = el && typeof el.scrollTop === 'number' ? el.scrollTop : 0;
    const lastScrollTop = lastScrollTopRef.current;
    const delta = scrollTop - lastScrollTop;
    lastScrollTopRef.current = scrollTop;
    // Ignore sub-pixel / rubber-band noise
    if (Math.abs(delta) < 4) return;
    const maxScroll = el ? Math.max(0, (el.scrollHeight || 0) - (el.clientHeight || 0)) : 0;
    // Near the bottom, never re-show from tiny upward deltas (padding oscillation)
    const nearBottom = maxScroll > 0 && (maxScroll - scrollTop) < 64;
    // Hiding the header shrinks this container's own padding-top by ~header height, which
    // shrinks maxScroll by the same amount. On a short list that can push maxScroll below the
    // current scrollTop, forcing the browser to clamp scrollTop straight back toward 0 -- felt
    // as "scroll won't go down / keeps snapping back up". Only hide once there is enough
    // scrollable room left that shrinking won't collapse it.
    const hasRoomToHide = maxScroll > 200;
    if (scrollTop < 10) {
      setIsHeaderVisible(true);
    } else if (delta > 0 && scrollTop > 56 && hasRoomToHide) {
      setIsHeaderVisible(false);
    } else if (delta < 0 && !nearBottom) {
      setIsHeaderVisible(true);
    }
  }, []);
  return { isHeaderVisible, onScroll };
}
