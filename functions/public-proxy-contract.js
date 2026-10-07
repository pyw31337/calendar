'use strict';

// Shared HTTP boundary for every public server-side proxy. Keep this outside index.js so the
// allow-list can be contract-tested without starting Firebase emulators or making paid calls.
function parsePublicHttpUrl(value) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > 2000) return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    if (host === 'localhost' || host === 'localhost.localdomain' || host === 'metadata.google.internal'
      || host === 'metadata.google.com' || host.endsWith('.internal')
      || /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)
      || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
      || host === '::1' || host.startsWith('fc') || host.startsWith('fd')) return null;
    return url;
  } catch (_) { return null; }
}

function setPublicCacheHeaders(res, maxAge = 300) {
  res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge}`);
  res.set('X-Content-Type-Options', 'nosniff');
}

module.exports = { parsePublicHttpUrl, setPublicCacheHeaders };
