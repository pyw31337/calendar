const functions = require('firebase-functions');
const admin = require('firebase-admin');
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
    subSnap.forEach(doc => {
      const data = doc.data();
      
      // Prevent echoing pushes back to the sender
      if (data.participantId === senderId) {
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
