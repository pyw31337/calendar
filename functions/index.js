const functions = require('firebase-functions');
const admin = require('firebase-admin');
const webpush = require('web-push');

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
