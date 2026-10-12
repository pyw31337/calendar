import { toDisplayUrl } from './app-address.js';

/**
 * A push click on an already-open calendar tab cannot rely on a full reload: sw.js posts
 * {type:'notification-open', url} (the URL a cold load would open) and this moves the open tab
 * there. Push URLs (?id=&tab=chat&msg=) and the open page are compared as short addresses.
 */
export function useNotificationOpen(React = window.React) {
  React.useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker || !navigator.serviceWorker.addEventListener) return undefined;
    const onMessage = (event) => {
      const data = event && event.data;
      if (!data || data.type !== 'notification-open' || !data.url) return;
      let next;
      try { next = new URL(String(data.url), window.location.href); } catch (_) { return; }
      if (next.origin !== window.location.origin) return;
      const target = toDisplayUrl(next.href, window.location.href);
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (target !== current) window.history.pushState(window.history.state, '', target);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, []);
}
