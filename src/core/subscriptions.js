/* P6-2 copy of Firestore subscription helpers from app-main.js
 * Live app still uses assets/app-main.js. Do not delete the originals yet.
 */
function subscribeMessages(calId, options, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribeMessages === 'function' && !svc.isScaffold) {
    return svc.subscribeMessages(calId, options, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('messages');
  const orderBy = (options && options.orderBy) || 'timestamp';
  const direction = (options && options.direction) || 'desc';
  q = q.orderBy(orderBy, direction);
  if (options && options.limit) q = q.limit(options.limit);
  return q.onSnapshot(onSnapshot, onError || function () {});
}

function subscribePlaces(calId, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribePlaces === 'function' && !svc.isScaffold) {
    return svc.subscribePlaces(calId, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  return firebaseDb.collection('calendars').doc('cal_' + calId).collection('places')
    .onSnapshot(onSnapshot, onError || function () {});
}

function subscribeMemos(calId, options, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribeMemos === 'function' && !svc.isScaffold) {
    return svc.subscribeMemos(calId, options, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  let q = firebaseDb.collection('calendars').doc('cal_' + calId).collection('memos');
  if (options && options.where) q = q.where(options.where[0], options.where[1], options.where[2]);
  if (options && options.orderBy) q = q.orderBy(options.orderBy, options.direction || 'desc');
  if (options && options.limit) q = q.limit(options.limit);
  return q.onSnapshot(onSnapshot, onError || function () {});
}

function subscribeAnniversaries(calId, onSnapshot, onError) {
  const svc = window.GATHER_FIREBASE_SERVICES;
  if (svc && typeof svc.subscribeAnniversaries === 'function' && !svc.isScaffold) {
    return svc.subscribeAnniversaries(calId, onSnapshot, onError);
  }
  if (!firebaseDb || !calId) return function () {};
  return firebaseDb.collection('calendars').doc('cal_' + calId).collection('anniversaries')
    .orderBy('createdAt', 'desc')
    .onSnapshot(onSnapshot, onError || function () {});
}
