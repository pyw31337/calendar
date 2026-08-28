const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const webpush = require('web-push');
const KoreanLunarCalendar = require('korean-lunar-calendar');

admin.initializeApp();

function parseMeetingDateTags(value) {
  const text = typeof value === 'string' ? value : '';
  const dates = new Set();
  const re = /(^|[^\d])(\d{6})(?!\d)/g;
  let match;
  while ((match = re.exec(text))) {
    const token = match[2];
    const year = 2000 + Number(token.slice(0, 2));
    const month = Number(token.slice(2, 4));
    const day = Number(token.slice(4, 6));
    const candidate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(`${candidate}T00:00:00Z`);
    if (date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day) dates.add(candidate);
  }
  return dates;
}

function getMessageImageEntriesForIndex(message) {
  const urls = Array.isArray(message.imageUrls) && message.imageUrls.length
    ? message.imageUrls : (message.imageUrl ? [message.imageUrl] : []);
  const thumbs = Array.isArray(message.thumbUrls) && message.thumbUrls.length
    ? message.thumbUrls : (message.thumbUrl ? [message.thumbUrl] : []);
  const tags = Array.isArray(message.imageTags) ? message.imageTags : [];
  const count = Math.max(urls.length, thumbs.length);
  return Array.from({ length: count }, (_, index) => ({
    index,
    imageUrl: urls[index] || thumbs[index] || '',
    thumbUrl: thumbs[index] || urls[index] || '',
    tags: tags[index] || message.tags || ''
  })).filter(entry => entry.imageUrl || entry.thumbUrl);
}

async function syncMeetingPhotoIndex(change, context) {
  const db = admin.firestore();
  const calendarRef = db.collection('calendars').doc(context.params.calendarDocId);
  const indexRef = calendarRef.collection('meetingPhotoIndex');
  const sourceMessageId = context.params.messageId;
  const oldSnap = await indexRef.where('sourceMessageId', '==', sourceMessageId).get();
  const batch = db.batch();
  oldSnap.forEach(doc => batch.delete(doc.ref));
  if (change.after.exists) {
    const message = change.after.data() || {};
    const entries = getMessageImageEntriesForIndex(message);
    entries.forEach(entry => {
      const dates = parseMeetingDateTags(entry.tags);
      dates.forEach(date => {
        const docId = `${date}_${sourceMessageId}_${entry.index}`.replace(/[^A-Za-z0-9_-]/g, '_');
        batch.set(indexRef.doc(docId), {
          date,
          sourceMessageId,
          sourceImageIndex: entry.index,
          imageUrl: entry.imageUrl,
          thumbUrl: entry.thumbUrl,
          tags: entry.tags,
          createdAt: Number(message.timestamp) || 0,
          updatedAt: Date.now()
        });
      });
    });
  }
  await batch.commit();
}

exports.onMessageMeetingPhotoIndexWrite = functions.firestore
  .document('calendars/{calendarDocId}/messages/{messageId}')
  .onWrite((change, context) => syncMeetingPhotoIndex(change, context));

// Public VAPID key is meant to be public (also embedded client-side in index.html, where the
// browser's pushManager.subscribe() needs it) -- only the private key is a secret. Configuring
// web-push happens lazily inside ensureVapidConfigured() rather than here at module scope,
// because this file's module-level code runs once per cold start for EVERY exported function
// below, but Secret Manager only injects VAPID_PRIVATE_KEY into the process.env of the specific
// functions that declare it (onMessageCreate, sendAnniversaryReminders via runWith({secrets})) --
// calling webpush.setVapidDetails with an undefined private key at module load would throw and
// break cold starts for unrelated functions like kakaoLocalSearchProxy that never send push.
const publicVapidKey = 'BNk35C4KAQy9JdQJ8uzLuzDAc7zUBCznmPFJc194fcWqEtD3EZTnj03ZCwE_P2SxwVILZnDzHsj2UZxIQ0Q-huU';
let vapidConfigured = false;
function ensureVapidConfigured() {
  if (vapidConfigured) return;
  webpush.setVapidDetails('mailto:partyboat1111@gmail.com', publicVapidKey, process.env.VAPID_PRIVATE_KEY);
  vapidConfigured = true;
}


/** Shared push broadcast for a calendar's push_subscriptions */
async function broadcastCalendarPush(calendarDocId, payloadObj, options = {}) {
  ensureVapidConfigured();
  const db = admin.firestore();
  const skipParticipantId = options.skipParticipantId || null;
  const channel = options.channel || 'chat'; // chat | memo | poll | schedule
  const subSnap = await db.collection('calendars').doc(calendarDocId).collection('push_subscriptions').get();
  if (subSnap.empty) {
    console.log('No push subscriptions for', calendarDocId);
    return { sent: 0 };
  }
  const payload = JSON.stringify(payloadObj);
  const promises = [];
  let skipped = 0;
  subSnap.forEach(doc => {
    const data = doc.data() || {};
    if (skipParticipantId && data.participantId === skipParticipantId) {
      skipped += 1;
      return;
    }
    // Channel filter: legacy docs without channels → chat only
    const ch = data.channels;
    if (ch && typeof ch === 'object') {
      if (ch[channel] === false) { skipped += 1; return; }
    } else if (channel !== 'chat') {
      skipped += 1;
      return;
    }
    const pushSubscription = {
      endpoint: data.endpoint,
      keys: { auth: data.keys && data.keys.auth, p256dh: data.keys && data.keys.p256dh }
    };
    const p = webpush.sendNotification(pushSubscription, payload, { urgency: 'high' })
      .then(() => console.log('Push ok', doc.id, channel))
      .catch(err => {
        console.error('Push fail', doc.id, err && err.statusCode);
        if (err.statusCode === 410 || err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 403) {
          return doc.ref.delete();
        }
      });
    promises.push(p);
  });
  await Promise.all(promises);
  return { sent: promises.length, skipped };
}


exports.onMessageCreate = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    ensureVapidConfigured();
    const calendarDocId = context.params.calendarDocId;
    const message = snapshot.data();

    // 일정 레이어팝업 사진탭('meeting')/갤러리 페이지('gallery')에서 올린 사진은 메시지
    // 문서에 저장되더라도 채팅 활동으로 취급하지 않는다. 채팅방 노출과 채팅 푸시는
    // 모두 uploadSource 기준으로 제외한다.
    if (message.uploadSource === 'meeting' || message.uploadSource === 'gallery') {
      console.log('Skipping push for non-chat photo upload:', message.uploadSource);
      return;
    }

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
    
    const bodyText = message.text?.trim() || (message.imageUrls?.length || message.imageUrl ? '사진을 보냈습니다' : '새 메시지가 도착했습니다');
    await broadcastCalendarPush(calendarDocId, {
      title: `${calendarTitle} · ${senderName}`,
      body: bodyText,
      url: `./?id=${calendarDocId.replace('cal_', '')}&view=chat`,
      tag: `chat-${calendarDocId}`
    }, { skipParticipantId: senderId, channel: 'chat' });
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

// Memo created → push (channel: memo)
exports.onMemoCreate = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/memos/{memoId}')
  .onCreate(async (snapshot, context) => {
    const calendarDocId = context.params.calendarDocId;
    const memo = snapshot.data() || {};
    const db = admin.firestore();
    const calendarSnap = await db.collection('calendars').doc(calendarDocId).get();
    if (!calendarSnap.exists) return;
    const calendarData = calendarSnap.data().calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';
    const author = memo.authorName || memo.participantName || '참여자';
    const body = (memo.text || memo.title || '새 메모').toString().trim().slice(0, 120) || '새 메모가 등록되었습니다';
    await broadcastCalendarPush(calendarDocId, {
      title: `${calendarTitle} · 메모`,
      body: `${author}: ${body}`,
      url: `./?id=${calendarDocId.replace('cal_', '')}&view=memo`,
      tag: `memo-${calendarDocId}-${context.params.memoId}`
    }, { skipParticipantId: memo.participantId || memo.authorId || null, channel: 'memo' });
  });

// Confirmed meeting write → schedule channel
exports.onConfirmedMeetingCreate = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}/confirmedMeetings/{dateId}')
  .onCreate(async (snapshot, context) => {
    const calendarDocId = context.params.calendarDocId;
    const after = snapshot.data() || {};
    const db = admin.firestore();
    const calendarSnap = await db.collection('calendars').doc(calendarDocId).get();
    if (!calendarSnap.exists) return;
    const calendarData = calendarSnap.data().calendar || {};
    const calendarTitle = calendarData.title || '모여라 캘린더';
    const dateLabel = context.params.dateId || after.date || '';
    await broadcastCalendarPush(calendarDocId, {
      title: `${calendarTitle} · 모임 확정`,
      body: dateLabel ? `${dateLabel} 모임이 확정되었습니다` : '모임이 확정되었습니다',
      url: `./?id=${calendarDocId.replace('cal_', '')}`,
      tag: `schedule-${calendarDocId}-${dateLabel}`
    }, { channel: 'schedule' });
  });

// Calendar document write → detect new polls
exports.onCalendarDocWrite = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).firestore
  .document('calendars/{calendarDocId}')
  .onUpdate(async (change, context) => {
    const beforeCal = (change.before.data() || {}).calendar || {};
    const afterCal = (change.after.data() || {}).calendar || {};
    const beforePolls = Array.isArray(beforeCal.polls) ? beforeCal.polls : [];
    const afterPolls = Array.isArray(afterCal.polls) ? afterCal.polls : [];
    const beforeIds = new Set(beforePolls.map(p => p && p.id).filter(Boolean));
    const newPolls = afterPolls.filter(p => p && p.id && !beforeIds.has(p.id));
    if (newPolls.length === 0) return;
    const calendarDocId = context.params.calendarDocId;
    const calendarTitle = afterCal.title || '모여라 캘린더';
    for (const poll of newPolls) {
      await broadcastCalendarPush(calendarDocId, {
        title: `${calendarTitle} · 투표`,
        body: poll.title ? `새 투표: ${poll.title}` : '새 투표가 등록되었습니다',
        url: `./?id=${calendarDocId.replace('cal_', '')}`,
        tag: `poll-${calendarDocId}-${poll.id}`
      }, { channel: 'poll' });
    }
  });

exports.sendAnniversaryReminders = functions.runWith({ secrets: ['VAPID_PRIVATE_KEY'] }).pubsub.schedule('0 9 * * *').timeZone('Asia/Seoul').onRun(async () => {
  ensureVapidConfigured();
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
        // Same urgency: 'high' reasoning as onMessageCreate above -- a same-day anniversary
        // reminder is only useful if it actually arrives that day.
        const p = webpush.sendNotification(pushSubscription, payload, { urgency: 'high' })
          .then(() => {
            console.log(`Anniversary push sent to subscription: ${subDoc.id}`);
          })
          .catch(err => {
            console.error(`Failed to send anniversary push to sub ${subDoc.id}:`, err);
            if (err.statusCode === 410 || err.statusCode === 404 || err.statusCode === 400 || err.statusCode === 403) {
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
// Value lives in Firebase Secret Manager (see firebase functions:secrets:set PEEKALINK_API_KEY),
// injected into process.env only for functions that declare it via runWith({secrets}) below.
const PEEKALINK_API_KEY = process.env.PEEKALINK_API_KEY;

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

// Generic per-IP, per-endpoint sliding-window throttle for the public proxy functions below
// (peekalinkProxy, kakaoLocalSearchProxy). Both proxies are unauthenticated by design (any
// calendar guest needs to reach them without a login step), which also means anyone who finds
// the URL can script requests against them directly -- without a per-caller limit, that would
// burn through Peekalink's shared 50/hour free-plan quota or Kakao's daily free quota for every
// real user, or run up Cloud Functions billing, with the abuser paying nothing themselves. Unlike
// checkAdminAuthRateLimit (which permanently locks out after N failures), this is a plain rolling
// counter with no lockout -- a burst over the limit just gets 429s until the window rolls over.
async function checkProxyRateLimit(bucketKey, ip, windowMs, maxRequests) {
  try {
    const docId = `${bucketKey}_${String(ip || 'unknown').replace(/[^a-zA-Z0-9.:_-]/g, '_').slice(0, 200) || 'unknown'}`;
    const ref = admin.firestore().collection('proxyRateLimits').doc(docId);
    const now = Date.now();
    let allowed = true;
    await admin.firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : null;
      const withinWindow = data && data.windowStart && (now - data.windowStart) < windowMs;
      const count = withinWindow ? (data.count || 0) : 0;
      if (count >= maxRequests) {
        allowed = false;
        return;
      }
      tx.set(ref, { windowStart: withinWindow ? data.windowStart : now, count: count + 1 });
    });
    return allowed;
  } catch (err) {
    // Fail closed when the limiter itself is unavailable. These endpoints proxy paid/quota-
    // limited services; allowing traffic through during a Firestore outage would turn a safety
    // failure into an unbounded abuse/billing event. The caller returns a normal 429 response.
    console.error(`checkProxyRateLimit(${bucketKey}) unavailable; denying request:`, err);
    return false;
  }
}

// Some sites (Coupang among them) answer a scraper's request with a 200 OK "차단/Access
// Denied" interstitial page instead of a real error status -- both Peekalink's own crawler and
// our fetchFallbackPreview() direct-fetch step below see this as a "successful" fetch with a
// real <title>, so without this check a bot-block page's title would be shown to the user as if
// it were the actual link's preview (exactly the "Access Denied" card reported for Coupang
// share links). KakaoTalk's own preview works for the same links because Coupang specifically
// allowlists Kakao's crawler IP/UA -- we have no equivalent allowlist relationship, so the best
// we can do is recognize the block page and fall through to a generic domain-only preview
// instead of showing the wrong content.
function looksLikeBlockedPreviewTitle(title) {
  const t = String(title || '').trim().toLowerCase();
  if (!t) return false;
  const blockedPatterns = [
    'access denied', 'forbidden', '403 forbidden', 'attention required',
    'just a moment', 'are you a human', 'bot detection', 'unusual traffic',
    'captcha', 'request blocked', 'error 1020'
  ];
  return blockedPatterns.some(p => t === p || t.includes(p));
}

async function fetchFallbackPreview(link) {
  try {
    const url = new URL(link);
    const domain = url.hostname.replace(/^www\./i, '');
    
    // 1. Check for Instagram specifically
    if (domain.includes('instagram.com')) {
      const isReel = url.pathname.includes('/reel/');
      return {
        ok: true,
        title: isReel ? "Instagram 릴스" : "Instagram 포스트",
        description: "Instagram 사진, 동영상 및 게시물 공유 링크입니다.",
        image: { medium: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/120px-Instagram_icon.png" } },
        siteName: 'Instagram',
        domain: 'instagram.com'
      };
    }
    
    // 2. Try fetching the page to parse open graph tags
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const pageRes = await fetch(link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (pageRes.ok) {
        const html = await pageRes.text();
        
        // simple regex parsing for og:title, og:description, og:image, og:site_name
        const getMetaContent = (property) => {
          const re1 = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
          const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i');
          const re3 = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
          const m1 = html.match(re1) || html.match(re2) || html.match(re3);
          return m1 ? m1[1] : null;
        };
        
        const rawTitle = getMetaContent('og:title') || html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
        const title = looksLikeBlockedPreviewTitle(rawTitle) ? '' : rawTitle;
        const description = getMetaContent('og:description') || getMetaContent('description') || '';
        const image = getMetaContent('og:image') || '';
        const siteName = getMetaContent('og:site_name') || domain;

        if (title || image || description) {
          return {
            ok: true,
            title: title.trim(),
            description: description.trim(),
            image: image ? { medium: { url: image } } : null,
            siteName: siteName.trim(),
            domain
          };
        }
      }
    } catch (e) {
      console.warn('Fallback HTML scraping failed for:', link, e);
    }
    
    // 3. Absolute generic fallback so ANY url shows a link preview!
    return {
      ok: true,
      title: domain,
      description: "공유된 링크입니다. 클릭하여 상세 내용을 확인하세요.",
      image: { medium: { url: `https://www.google.com/s2/favicons?sz=128&domain=${domain}` } },
      siteName: domain,
      domain
    };
  } catch (err) {
    console.error('fetchFallbackPreview failed:', err);
    return null;
  }
}

exports.peekalinkProxy = functions.runWith({ secrets: ['PEEKALINK_API_KEY'] }).https.onRequest(async (req, res) => {
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
  // 20/hour per IP -- comfortably above any single real user's pace, well under the shared
  // 50/hour Peekalink free-plan ceiling so one abusive caller can't exhaust it for everyone else.
  if (!(await checkProxyRateLimit('peekalink', req.ip, 60 * 60 * 1000, 20))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
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
    if (peekalinkRes.ok) {
      const json = await peekalinkRes.json();
      if (json && json.ok && json.title && !looksLikeBlockedPreviewTitle(json.title)) {
        res.status(200).json(json);
        return;
      }
    }
  } catch (err) {
    console.error('Peekalink proxy request failed:', err);
  }

  // If Peekalink failed or did not return valid title, fall back to our custom implementation
  const fallback = await fetchFallbackPreview(link);
  if (fallback) {
    res.status(200).json(fallback);
  } else {
    res.status(502).json({ ok: false, message: 'Link preview failed' });
  }
});

// Proxies Kakao Local (키워드 검색) requests so the REST API key never ships to the browser --
// same reasoning as peekalinkProxy above. Used by the 장소등록 search field (PlaceRegisterModal
// in index.html): Nominatim/OSM has almost no Korean business-name coverage (e.g. searching
// "스타벅스" only returns Japan branches), so Kakao Local is the primary geocoder for Korean POI
// search, with Nominatim kept as a fallback for plain addresses/landmarks Kakao doesn't have.
//
// This key belongs to a different Kakao Developers app ("Culture Flow") than the one this
// project was originally set up under ("Metro Live") -- Metro Live's own 카카오맵 product was
// never activated, and Kakao only grants the one-time free daily quota to the FIRST app that
// activates it account-wide, so activating it on Metro Live now would require attaching a
// payment method with no free quota at all. Culture Flow already holds that free quota, so this
// key reuses it instead -- its REST key must have its IP allowlist cleared (or set to allow-all)
// in Kakao Developers, since Cloud Functions has no fixed outbound IP to register there.
// Value lives in Firebase Secret Manager (see firebase functions:secrets:set KAKAO_REST_API_KEY),
// injected into process.env only for kakaoLocalSearchProxy via runWith({secrets}) below.
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

// Tracks daily call volume against Kakao's free quota (see 어드민 통계 탭's 외부 서비스 연동
// 현황 card) -- incremented here rather than client-side like incrementLinkPreviewStat, since
// the actual Kakao call happens server-side in this function, not in the browser. Uses the
// Admin SDK so no firestore.rules write access is needed for this doc.
async function incrementKakaoLocalSearchStat() {
  try {
    // Kakao's own quota window resets at KST midnight (it's a Korean service), and Cloud
    // Functions run in UTC -- offsetting by +9h before formatting keeps this doc's "today" in
    // sync with the same day Kakao's own console would show, rather than rolling over 9 hours
    // early/late relative to it.
    const todayBucket = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const ref = admin.firestore().collection('appConfig').doc('kakaoLocalSearchStats');
    await admin.firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : null;
      const sameBucket = data && data.dailyUsageBucket === todayBucket;
      tx.set(ref, {
        dailyUsageBucket: todayBucket,
        dailyUsageCount: sameBucket ? (data.dailyUsageCount || 0) + 1 : 1,
        updatedAt: Date.now()
      });
    });
  } catch (err) {
    console.warn('incrementKakaoLocalSearchStat failed (non-fatal):', err);
  }
}

exports.kakaoLocalSearchProxy = functions.runWith({ secrets: ['KAKAO_REST_API_KEY'] }).https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const query = String(req.query.query || '').trim().slice(0, 200);
  if (!query) { res.status(400).json({ ok: false, message: 'query is required' }); return; }
  // 30/minute per IP -- generous for a real person typing/refining a place search, but stops a
  // scripted caller from burning through the free daily quota this whole app shares.
  if (!(await checkProxyRateLimit('kakao', req.ip, 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
  try {
    const kakaoRes = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`, {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` }
    });
    // Awaited (rather than fire-and-forget) so the write reliably completes before this HTTP
    // function's instance is frozen once the response below is sent.
    await incrementKakaoLocalSearchStat();
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

// Overseas 장소 검색 폴백 -- Kakao Local is Korea-only, so PlaceRegisterModal.handleSearch only
// calls this when a Kakao search comes back empty (see assets/app-main.js), which in practice
// means either a typo or a place outside Korea. Google Places (New) has far better POI coverage
// abroad than Nominatim/OSM, at the cost of being a genuinely billed API past its free monthly
// SKU threshold -- see incrementGooglePlacesSearchStat below and the matching 통계 탭 card.
// Value lives in Firebase Secret Manager (see firebase functions:secrets:set
// GOOGLE_PLACES_API_KEY), injected into process.env only for googlePlacesSearchProxy via
// runWith({secrets}) below.
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Tracks monthly call volume against Google Places' free SKU threshold (see 어드민 통계 탭's
// 외부 서비스 연동 현황 card) -- unlike Kakao's daily bucket, this is monthly since that's how
// Google's own free tier resets, and because this API can actually incur real cost past it.
async function incrementGooglePlacesSearchStat() {
  try {
    const monthBucket = new Date().toISOString().slice(0, 7); // YYYY-MM (UTC)
    const ref = admin.firestore().collection('appConfig').doc('googlePlacesSearchStats');
    await admin.firestore().runTransaction(async tx => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : null;
      const sameBucket = data && data.monthlyUsageBucket === monthBucket;
      tx.set(ref, {
        monthlyUsageBucket: monthBucket,
        monthlyUsageCount: sameBucket ? (data.monthlyUsageCount || 0) + 1 : 1,
        updatedAt: Date.now()
      });
    });
  } catch (err) {
    console.warn('incrementGooglePlacesSearchStat failed (non-fatal):', err);
  }
}

exports.googlePlacesSearchProxy = functions.runWith({ secrets: ['GOOGLE_PLACES_API_KEY'] }).https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'GET') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const query = String(req.query.query || '').trim().slice(0, 200);
  if (!query) { res.status(400).json({ ok: false, message: 'query is required' }); return; }
  // 30/minute per IP -- same ceiling as kakaoLocalSearchProxy. This proxy is only ever reached
  // after a Kakao search already came back empty (see handleSearch's fallback chain), so real
  // traffic here is inherently lower than Kakao's, but the cap still exists to stop a scripted
  // caller from running up billing on a genuinely paid API.
  if (!(await checkProxyRateLimit('googlePlaces', req.ip, 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
  try {
    // FieldMask is deliberately limited to Essentials/Pro-tier fields (id/name/address/location)
    // -- requesting Enterprise-tier fields (phone, website, opening hours, etc.) would bump every
    // call to a more expensive SKU for data this feature doesn't even use.
    const googleRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
      },
      body: JSON.stringify({ textQuery: query, languageCode: 'ko' })
    });
    // Awaited (rather than fire-and-forget) so the write reliably completes before this HTTP
    // function's instance is frozen once the response below is sent.
    await incrementGooglePlacesSearchStat();
    if (!googleRes.ok) {
      res.status(googleRes.status).json({ ok: false, message: 'Google Places search failed' });
      return;
    }
    const json = await googleRes.json();
    res.status(200).json({ ok: true, places: json.places || [] });
  } catch (err) {
    console.error('googlePlacesSearchProxy failed:', err);
    res.status(502).json({ ok: false, message: 'Google Places search request failed' });
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
  // 30/hour per IP -- comfortably above the legitimate caller's pace (the OG-refresh GitHub
  // Action hits this every 15 minutes, i.e. 4/hour) while stopping a scripted caller from forcing
  // repeated full-collection scans at no cost to themselves, same reasoning as peekalinkProxy/
  // kakaoLocalSearchProxy above.
  if (!(await checkProxyRateLimit('publicSummaries', req.ip, 60 * 60 * 1000, 30))) {
    res.status(429).json({ ok: false, message: 'Too many requests' });
    return;
  }
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

function slimCalendarForAdminList(cal, mode) {
  if (!cal || typeof cal !== 'object') return cal;
  const places = Array.isArray(cal.places) ? cal.places : [];
  const activityLogs = Array.isArray(cal.activityLogs) ? cal.activityLogs : [];
  const availabilities = Array.isArray(cal.availabilities) ? cal.availabilities : [];
  if (mode === 'summary') {
    return {
      id: cal.id, title: cal.title || '', description: cal.description || '',
      accentColor: cal.accentColor || '', revision: cal.revision || 0, updatedAt: cal.updatedAt || 0,
      participants: Array.isArray(cal.participants) ? cal.participants : [],
      settlementBaseBudget: cal.settlementBaseBudget || 0,
      expenseCategories: cal.expenseCategories || null, placeCategories: cal.placeCategories || null,
      polls: Array.isArray(cal.polls) ? cal.polls : [],
      places: [], activityLogs: [], availabilities: [],
      _placesCount: places.length, _activityLogsCount: activityLogs.length, _availabilitiesCount: availabilities.length
    };
  }
  const { places: _p, activityLogs: _a, ...rest } = cal;
  return { ...rest, places: [], activityLogs: [], _placesCount: places.length, _activityLogsCount: activityLogs.length };
}

exports.listAllCalendars = functions.https.onRequest(async (req, res) => {
  setAdminCorsHeaders(res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, message: 'Method not allowed' }); return; }
  const password = req.body && req.body.password;
  if (!password || typeof password !== 'string') { res.status(400).json({ ok: false, message: 'password is required' }); return; }
  const mode = (req.body && req.body.mode === 'full') ? 'full' : 'summary';

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
        calendars.push(slimCalendarForAdminList(data.calendar, mode));
        lastModified = Math.max(lastModified, data.lastModified || 0);
      }
    });
    res.status(200).json({ ok: true, calendars, lastModified, mode });
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

// adminAuthAttempts (one doc per IP that's ever failed an admin login) and proxyRateLimits (one
// doc per IP+endpoint that's ever called peekalinkProxy/kakaoLocalSearchProxy) both accumulate
// permanently -- nothing ever deletes an old doc once its lockout/rate-limit window has passed.
// Both windows are well under a day (15 minutes and 1 hour respectively), so anything with a
// windowStart older than 24h is unambiguously stale and safe to prune. Runs daily alongside the
// existing sendAnniversaryReminders schedule.
exports.pruneStaleRateLimitDocs = functions.pubsub.schedule('30 9 * * *').timeZone('Asia/Seoul').onRun(async () => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const db = admin.firestore();
  for (const collectionName of ['adminAuthAttempts', 'proxyRateLimits']) {
    const snap = await db.collection(collectionName).where('windowStart', '<', cutoff).get();
    if (snap.empty) continue;
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Pruned ${snap.size} stale doc(s) from ${collectionName}`);
  }
  return null;
});
