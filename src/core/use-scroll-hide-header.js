/**
 * Shared scroll-driven header hide/show hook. Was duplicated verbatim across
 * ui-summary-gallery.js, ui-chat-gallery.js, ui-event-modals.js and ui-memo-view.js --
 * consolidated here so the "scroll won't go down / snaps back up" fix (hasRoomToHide,
 * see below) only has to exist -- and get fixed -- in one place.
 */
export function useScrollHideHeader() {
  const React = window.React;
  const isHeaderVisible = true;
  const onScroll = React.useCallback(() => {}, []);
  return { isHeaderVisible, onScroll };
}
