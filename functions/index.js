const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const webpush = require('web-push');
const KoreanLunarCalendar = require('korean-lunar-calendar');

admin.initializeApp();

// VAPID keys for Web Push authentication
const publicVapidKey = 'BNk35C4KAQy9JdQJ8uzLuzDAc7zUBCznmPFJc194fcWqEtD3EZTnj03ZCwE_P2SxwVILZnDzHsj2UZxIQ0Q-huU';
const privateVapidKey = '6tfgyZUb3MoTEhjaM1Nrssss8DrPFVoWUKJlsjOpRm8';

webpush.setVapidDetails(
  'mailto:partyboat1111@gmail.com',
  publicVapidKey,
  privateVapidKey
);

exports.onMessageCreate = functions.firestore
  .document('calendars/{calendarDocId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const calendarDocId = context.params.calendarDocId;
    const message = snapshot.data();
    
    const db = admin.firestore();
    
    // 1. Get calendar details to retrieve title and participants
    const calendarSnap = await db.collection('calendars').doc(calendarDocId).get();
    if (!calendarSnap.exists) {
      console.log('Calendar does not exist:', calendarDocId);
      return;
    }
    const calendarData = calendarSnap.data().calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';
    
    // 2. Resolve sender name
    const senderId = message.participantId;
    const participants = calendarData.participants || [];
    const sender = participants.find(p => p.id === senderId) || { name: '알수없음' };
    const senderName = sender.name;
    
    // 3. Format push payload
    const bodyText = message.text?.trim() || (message.imageUrls?.length || message.imageUrl ? '사진을 보냈습니다' : '새 메시지가 도착했습니다');
    
    const payload = JSON.stringify({
      title: `${calendarTitle} · ${senderName}`,
      body: bodyText,
      url: `./?id=${calendarDocId.replace('cal_', '')}&view=chat`,
      tag: `chat-${calendarDocId}`
    });
    
    // 4. Retrieve push subscriptions
    const subSnap = await db.collection('calendars').doc(calendarDocId).collection('push_subscriptions').get();
    if (subSnap.empty) {
      console.log('No push subscriptions for calendar:', calendarDocId);
      return;
    }
    
    // 5. Broadcast push notifications to all participants except the sender
    const promises = [];
    let totalSubscriptions = 0;
    let skippedSenderSubscriptions = 0;
    subSnap.forEach(doc => {
      const data = doc.data();
      totalSubscriptions += 1;
      
      // Prevent echoing pushes back to the sender
      if (data.participantId === senderId) {
        skippedSenderSubscriptions += 1;
        return;
      }
      
      const pushSubscription = {
        endpoint: data.endpoint,
        keys: {
          auth: data.keys?.auth,
          p256dh: data.keys?.p256dh
        }
      };
      
      const p = webpush.sendNotification(pushSubscription, payload)
        .then(() => {
          console.log(`Push sent successfully to subscription: ${doc.id}`);
        })
        .catch(err => {
          console.error(`Failed to send push to sub ${doc.id}:`, err);
          // If endpoint is expired or unregistered (HTTP 410 or 404), clean it up from database
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`Removing expired subscription: ${doc.id}`);
            return doc.ref.delete();
          }
        });
      promises.push(p);
    });
    console.log(`Push subscription scan for ${calendarDocId}: total=${totalSubscriptions}, skippedSender=${skippedSenderSubscriptions}, targets=${promises.length}`);
    if (promises.length === 0) {
      console.log('No push targets after sender filtering:', calendarDocId);
      return;
    }
    
    await Promise.all(promises);
  });

// Mirrors the client's getAnniversariesForDate matching logic (index.html) so a lunar birthday
// notifies on the same day the app itself would highlight it. Lunar anniversaries store only a
// month/day (no year) -- reinterpreting them against THIS year as the lunar year and converting
// to solar is the same equivalence trick the client uses, rather than converting today's solar
// date to lunar (either direction works; matching the client's exact approach keeps the two
// unambiguously in sync).
function isAnniversaryToday(ann, y, m, d) {
  if (!ann) return false;
  if (ann.type === 'yearly') {
    if (!ann.date) return false;
    if (ann.isLunar) {
      try {
        const cal = new KoreanLunarCalendar();
        const [lunarM, lunarD] = ann.date.split('-').map(Number);
        cal.setLunarDate(y, lunarM, lunarD, !!ann.isLeap);
        const solar = cal.getSolarCalendar();
        return !!solar && Number(solar.year) === y && Number(solar.month) === m && Number(solar.day) === d;
      } catch (e) {
        return false;
      }
    }
    const [solarM, solarD] = ann.date.split('-').map(Number);
    return solarM === m && solarD === d;
  }
  if (ann.type === 'dday') {
    return ann.targetDate === `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return false;
}

// Daily anniversary push -- fires once at 09:00 KST, scans every calendar's anniversaries
// subcollection via a single collectionGroup query (cheaper than looping per-calendar fetches),
// and pushes to every subscriber of a calendar with a match today. New Cloud Function; requires
// `firebase deploy --only functions` to go live (unlike the rest of this app, which redeploys
// automatically via GitHub Pages on merge to main).
exports.sendAnniversaryReminders = functions.pubsub.schedule('0 9 * * *').timeZone('Asia/Seoul').onRun(async () => {
  const kstParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const y = Number(kstParts.find(p => p.type === 'year').value);
  const m = Number(kstParts.find(p => p.type === 'month').value);
  const d = Number(kstParts.find(p => p.type === 'day').value);

  const db = admin.firestore();
  const annSnap = await db.collectionGroup('anniversaries').get();

  const byCalendar = new Map();
  annSnap.forEach(doc => {
    const ann = { id: doc.id, ...doc.data() };
    if (!isAnniversaryToday(ann, y, m, d)) return;
    const calendarRef = doc.ref.parent.parent;
    if (!calendarRef) return;
    if (!byCalendar.has(calendarRef.id)) byCalendar.set(calendarRef.id, { ref: calendarRef, anniversaries: [] });
    byCalendar.get(calendarRef.id).anniversaries.push(ann);
  });

  if (byCalendar.size === 0) {
    console.log('No anniversaries today.');
    return null;
  }

  const promises = [];
  for (const [calendarDocId, entry] of byCalendar) {
    const calendarSnap = await entry.ref.get();
    if (!calendarSnap.exists) continue;
    const calendarData = calendarSnap.data().calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';

    const subSnap = await entry.ref.collection('push_subscriptions').get();
    if (subSnap.empty) continue;

    entry.anniversaries.forEach(ann => {
      const payload = JSON.stringify({
        title: `${calendarTitle} · 오늘의 기념일`,
        body: `🎉 ${ann.title || '기념일'}`,
        url: `./?id=${calendarDocId.replace('cal_', '')}`,
        tag: `anniversary-${calendarDocId}-${ann.id}`
      });
      subSnap.forEach(subDoc => {
        const data = subDoc.data();
        const pushSubscription = {
          endpoint: data.endpoint,
          keys: { auth: data.keys?.auth, p256dh: data.keys?.p256dh }
        };
        const p = webpush.sendNotification(pushSubscription, payload)
          .then(() => {
            console.log(`Anniversary push sent to subscription: ${subDoc.id}`);
          })
          .catch(err => {
            console.error(`Failed to send anniversary push to sub ${subDoc.id}:`, err);
            if (err.statusCode === 410 || err.statusCode === 404) {
              console.log(`Removing expired subscription: ${subDoc.id}`);
              return subDoc.ref.delete();
            }
          });
        promises.push(p);
      });
    });
  }

  await Promise.all(promises);
  return null;
});

// Proxies link-preview requests to Peekalink so the API key never ships to the browser. The
// client (index.html's fetchLinkPreview) is a static site with no backend of its own -- calling
// Peekalink directly from there meant the key was visible to anyone via view-source. This
// function holds the key server-side only and forwards the exact same request/response shape
// Peekalink itself uses, so the client only needs to point at this URL instead.
const PEEKALINK_API_KEY = 'sk_w8czszf1m50xm1pbuknazw60recwmc2q';

// Peekalink's scraper can't reliably read YouTube's og:meta tags -- video pages are JS-heavy and
// commonly block/return empty results for generic scrapers, which is why chat messages sharing a
// YouTube link never got a preview card under it. YouTube's own oEmbed endpoint is purpose-built
// for exactly this (title/author/thumbnail, no API key, no CORS restriction for a server-to-server
// call) so it's tried first for youtube.com/youtu.be links, with Peekalink kept as the fallback
// for anything oEmbed can't resolve (e.g. a private or deleted video).
function extractYouTubeId(link) {
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (host === 'youtube.com' || host === 'music.youtube.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const shortsMatch = u.pathname.match(/^\/(shorts|live|embed)\/([^/]+)/);
      if (shortsMatch) return shortsMatch[2];
    }
  } catch (e) {
    // not a valid URL -- let the caller fall through to Peekalink
  }
  return null;
}

async function fetchYouTubeOembedPreview(link) {
  const youtubeId = extractYouTubeId(link);
  if (!youtubeId) return null;
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(link)}&format=json`);
    if (!oembedRes.ok) return null;
    const oembed = await oembedRes.json();
    return {
      ok: true,
      title: oembed.title || '',
      description: oembed.author_name ? `${oembed.author_name} · YouTube` : '',
      image: { medium: { url: oembed.thumbnail_url || '' } },
      siteName: 'YouTube',
      domain: 'youtube.com'
    };
  } catch (err) {
    console.error('YouTube oEmbed fetch failed, falling back to Peekalink:', err);
    return null;
  }
}

exports.peekalinkProxy = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method not allowed' });
    return;
  }
  const link = req.body && req.body.link;
  if (!link || typeof link !== 'string') {
    res.status(400).json({ ok: false, message: 'link is required' });
    return;
  }
  const youtubePreview = await fetchYouTubeOembedPreview(link);
  if (youtubePreview) {
    res.status(200).json(youtubePreview);
    return;
  }
  try {
    const peekalinkRes = await fetch('https://api.peekalink.io/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PEEKALINK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ link })
    });
    const json = await peekalinkRes.json();
    res.status(peekalinkRes.status).json(json);
  } catch (err) {
    console.error('Peekalink proxy request failed:', err);
    res.status(502).json({ ok: false, message: 'Peekalink request failed' });
  }
});

// Proxies Kakao Local (키워드 검색) requests so the REST API key never ships to the browser --
// same reasoning as peekalinkProxy above. Used by the 장소등록 search field (PlaceRegisterModal
// in index.html): Nominatim/OSM has almost no Korean business-name coverage (e.g. searching
// "스타벅스" only returns Japan branches), so Kakao Local is the primary geocoder for Korean POI
// search, with Nominatim kept as a fallback for plain addresses/landmarks Kakao doesn't have.
const KAKAO_REST_API_KEY = '1e932da4b24f87406d6d5204bc95f303';
exports.kakaoLocalSearchProxy = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const query = String(req.query.query || '').trim().slice(0, 200);
  if (!query) { res.status(400).json({ ok: false, message: 'query is required' }); return; }
  try {
    const kakaoRes = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`, {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` }
    });
    if (!kakaoRes.ok) {
      res.status(kakaoRes.status).json({ ok: false, message: 'Kakao local search failed' });
      return;
    }
    const json = await kakaoRes.json();
    res.status(200).json({ ok: true, documents: json.documents || [] });
  } catch (err) {
    console.error('kakaoLocalSearchProxy failed:', err);
    res.status(502).json({ ok: false, message: 'Kakao local search request failed' });
  }
});

// Public, unauthenticated: returns only {id, title, description} for every calendar, for the
// GitHub Actions "Refresh Calendar OG Pages" job (scripts/generate-og-pages.mjs), which needs to
// enumerate all calendars to regenerate their public share/OG preview pages. That's the same
// information any share link already exposes via its og:title/og:description meta tags before
// the recipient even opens the page, so serving it without auth doesn't reopen the enumeration
// hole listAllCalendars/adminVerifyPassword above were built to close -- this function explicitly
// never touches participants/messages/expenses/places/polls/etc.
exports.listPublicCalendarSummaries = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  try {
    const snap = await admin.firestore().collection('calendars').get();
    const calendars = [];
    snap.forEach(doc => {
      const cal = doc.data()?.calendar;
      if (cal?.id) calendars.push({ id: cal.id, title: cal.title || '', description: cal.description || '' });
    });
    res.status(200).json({ ok: true, calendars });
  } catch (err) {
    console.error('listPublicCalendarSummaries failed:', err);
    res.status(500).json({ ok: false, message: '캘린더 목록을 불러오지 못했습니다.' });
  }
});

// --- Admin auth (listAllCalendars / adminVerifyPassword / adminChangePassword) ---
//
// This app has no real user accounts -- individual calendars are protected only by their ID
// being hard to guess (a share-link model), which firestore.rules enforces by scoping every
// read/write to a caller-supplied calendar ID. The admin dashboard's cross-calendar view broke
// that model: it needs to enumerate EVERY calendar, and firestore.rules had `allow list: if
// true` on the calendars collection to let it do that client-side -- which also let anyone
// (not just an authenticated admin) list every calendar ID and read every calendar's data
// directly via the Firestore SDK/REST API, bypassing the admin password screen entirely (that
// screen only ever ran a hash comparison in the browser; it never gated the data itself). The
// admin password's stored hash was in the same boat: appConfig/adminAuth allowed any
// correctly-shaped write, so anyone could overwrite it and log in as admin with a password of
// their choosing, with no need to know the real one.
//
// The fix moves both operations behind these three functions, which use the Admin SDK (always
// bypasses firestore.rules, since only *this* server-side code can invoke it) so the client SDK
// no longer needs (or is granted) direct list/write access to that data. firestore.rules should
// have `list` on /calendars and `create`/`update` on appConfig/adminAuth disabled to match.
const DEFAULT_ADMIN_PASSWORD_HASH = '32625be384ed05129315617a65f0b070e7b35a4257bdd11e0d98185c6f0cecfe'; // sha256("0602")

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

async function getStoredAdminPasswordHash() {
  const snap = await admin.firestore().collection('appConfig').doc('adminAuth').get();
  const hash = snap.exists ? snap.data()?.passwordHash : null;
  return typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash) ? hash : DEFAULT_ADMIN_PASSWORD_HASH;
}

// Simple per-IP lockout so the (short, PIN-style) admin password can't be brute-forced online --
// this doc lives outside anything the client SDK can reach (no matching firestore.rules entry,
// so the default-deny catch-all applies), and is only ever touched by this Admin-SDK code.
const ADMIN_AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_AUTH_RATE_LIMIT_MAX_FAILURES = 10;

async function checkAdminAuthRateLimit(ip) {
  const docId = String(ip || 'unknown').replace(/[^a-zA-Z0-9.:_-]/g, '_').slice(0, 200) || 'unknown';
  const ref = admin.firestore().collection('adminAuthAttempts').doc(docId);
  const snap = await ref.get();
  const now = Date.now();
  const data = snap.exists ? snap.data() : null;
  const withinWindow = data && data.windowStart && (now - data.windowStart) < ADMIN_AUTH_RATE_LIMIT_WINDOW_MS;
  if (withinWindow && (data.failCount || 0) >= ADMIN_AUTH_RATE_LIMIT_MAX_FAILURES) {
    return { blocked: true, ref };
  }
  // Only used as a fast pre-check to skip the sha256 comparison below when a caller is already
  // over the limit -- the actual count that determines the NEXT request's blocked state is only
  // ever incremented inside recordAdminAuthResult's transaction, so a stale read here can't
  // undercount failures.
  return { blocked: false, ref };
}

// Wrapped in a transaction (re-reading the doc at increment time) rather than trusting the
// failCount checkAdminAuthRateLimit read earlier -- a plain read-then-set here would lose
// increments under concurrent requests from the same IP (each reads the same pre-increment
// count, so N parallel failed attempts could all land as a single +1 instead of +N), which
// would let a scripted brute-force attacker bypass the lockout entirely by firing requests in
// parallel batches instead of serially.
async function recordAdminAuthResult(rateState, success) {
  if (success) {
    await rateState.ref.delete().catch(() => {});
    return;
  }
  const now = Date.now();
  await admin.firestore().runTransaction(async tx => {
    const snap = await tx.get(rateState.ref);
    const data = snap.exists ? snap.data() : null;
    const withinWindow = data && data.windowStart && (now - data.windowStart) < ADMIN_AUTH_RATE_LIMIT_WINDOW_MS;
    const windowStart = withinWindow ? data.windowStart : now;
    const failCount = (withinWindow ? (data.failCount || 0) : 0) + 1;
    tx.set(rateState.ref, { failCount, windowStart });
  }).catch(() => {});
}

function setAdminCorsHeaders(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

// Verifies a submitted password against the stored admin hash, without returning any calendar
// data -- used by the login screen itself (see AdminLoginGate in index.html), separately from
// listAllCalendars below so the login check stays cheap even when the dashboard doesn't need
// a full data reload (e.g. re-validating an existing session).
exports.adminVerifyPassword = functions.https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const password = req.body && req.body.password;
  if (!password || typeof password !== 'string') { res.status(400).json({ ok: false, message: 'password is required' }); return; }

  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false, message: '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해 주세요.' }); return; }

  const [storedHash] = await Promise.all([getStoredAdminPasswordHash()]);
  const matches = sha256Hex(password.trim()) === storedHash;
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false, message: '비밀번호가 올바르지 않습니다.' }); return; }
  res.status(200).json({ ok: true });
});

// Returns every calendar's document (the admin dashboard's cross-calendar view) after verifying
// the submitted password server-side -- the only place this data leaves the server now that
// /calendars no longer allows a client-side `list`.
exports.listAllCalendars = functions.https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const password = req.body && req.body.password;
  if (!password || typeof password !== 'string') { res.status(400).json({ ok: false, message: 'password is required' }); return; }

  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false, message: '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해 주세요.' }); return; }

  const storedHash = await getStoredAdminPasswordHash();
  const matches = sha256Hex(password.trim()) === storedHash;
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false, message: '비밀번호가 올바르지 않습니다.' }); return; }

  try {
    const snap = await admin.firestore().collection('calendars').get();
    const calendars = [];
    let lastModified = 0;
    snap.forEach(doc => {
      const data = doc.data();
      if (data?.calendar?.id) {
        calendars.push(data.calendar);
        lastModified = Math.max(lastModified, data.lastModified || 0);
      }
    });
    res.status(200).json({ ok: true, calendars, lastModified });
  } catch (err) {
    console.error('listAllCalendars failed:', err);
    res.status(500).json({ ok: false, message: '캘린더 목록을 불러오지 못했습니다.' });
  }
});

// Changes the admin password after verifying the current one server-side -- appConfig/adminAuth
// no longer accepts a direct client write, so this is the only way to change it now.
exports.adminChangePassword = functions.https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const { oldPassword, newPasswordHash } = req.body || {};
  if (!oldPassword || typeof oldPassword !== 'string') { res.status(400).json({ ok: false, message: 'oldPassword is required' }); return; }
  if (!newPasswordHash || typeof newPasswordHash !== 'string' || !/^[a-f0-9]{64}$/.test(newPasswordHash)) {
    res.status(400).json({ ok: false, message: 'newPasswordHash must be a sha256 hex digest' });
    return;
  }

  const rateState = await checkAdminAuthRateLimit(req.ip);
  if (rateState.blocked) { res.status(429).json({ ok: false, message: '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해 주세요.' }); return; }

  const storedHash = await getStoredAdminPasswordHash();
  const matches = sha256Hex(oldPassword.trim()) === storedHash;
  await recordAdminAuthResult(rateState, matches);
  if (!matches) { res.status(401).json({ ok: false, message: '현재 비밀번호가 올바르지 않습니다.' }); return; }

  try {
    await admin.firestore().collection('appConfig').doc('adminAuth').set({
      passwordHash: newPasswordHash,
      updatedAt: Date.now()
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('adminChangePassword failed:', err);
    res.status(500).json({ ok: false, message: '비밀번호 변경에 실패했습니다.' });
  }
});
