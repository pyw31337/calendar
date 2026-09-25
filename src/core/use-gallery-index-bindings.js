// U12 (docs/app-main-split-units.md): the gallery index bindings, moved out of CalendarApp
// verbatim. Two server-side indexes feed the photo surfaces (calendar album, gallery, 보관함,
// lightbox):
//   - the photoIndex (useGalleryPhotoIndex): the paged, CF-maintained photo list and its tags;
//   - the photoComments store: per-photo comment counts (thumbnail badges) plus the comment
//     arrays themselves, preloaded so opening a lightbox does not do serial document reads.
// CalendarApp still owns everything that writes through them (tag saves via
// app-image-tag-save.js, photo delete's galleryPhotoIndex.patchItems, handleSavePhotoComments)
// and gets the index, the counts/preloaded state, their setters and the store ref back here.
//
// getFirebaseDb reads CalendarApp's module-level Firestore handle live at effect time, exactly
// like the original inline effect did (the value itself is also passed for the deps array).
import { useGalleryPhotoIndex } from './photo-index.js';
import { createPhotoCommentStore } from './photo-comment-store.js';
import { firebaseConfig, fetchPhotoCommentCountsRest, firestoreDocumentToJs } from './app-firebase-data.js';

export function useGalleryIndexBindings({
  React,
  activeCalId,
  activeView,
  firebaseDb,
  getFirebaseDb,
  firebaseConnectionVersion
}) {
  // 사진별 댓글 개수(라이트박스 댓글 뱃지용) -- 사진의 mediaKey/refKey를 문서 id로 쓰는
  // calendars/cal_{id}/photoComments 컬렉션을 그대로 구독한다. 댓글이 실제로 달린 사진만
  // 문서가 존재하므로(빈 배열은 안 씀) 컬렉션 크기가 항상 작게 유지된다 -- see the realtime
  // listener below.
  const [photoCommentCounts, setPhotoCommentCounts] = React.useState({});
  const [preloadedPhotoComments, setPreloadedPhotoComments] = React.useState({});
  const [preloadedPhotoCommentsReady, setPreloadedPhotoCommentsReady] = React.useState(false);
  // The badge subscription already receives every small photoComments document. Retain the
  // comment arrays too, so opening a lightbox does not perform several serial document reads.
  const photoCommentStoreRef = React.useRef(null);

  const galleryPhotoIndex = useGalleryPhotoIndex({
    React, calendarId: activeCalId, activeView,
    projectId: firebaseConfig.projectId, decodeDocument: firestoreDocumentToJs
  });

  // 사진 댓글 개수 실시간 구독 -- 썸네일 우측 상단 뱃지(캘린더 일정/갤러리 등)에 쓰인다. 댓글이
  // 실제로 달린 사진만 문서가 존재하므로 컬렉션 자체가 작게 유지되어, 전체 스냅샷을 그대로
  // 구독해도(개별 문서 get을 여러 번 하는 대신) 부담이 적다. 썸네일에 뱃지가 실제로 보이는
  // 화면(캘린더/갤러리/보관함)에서만 구독한다.
  const needsPhotoCommentCounts = React.useMemo(
    () => activeView === 'calendar' || activeView === 'gallery' || activeView === 'history',
    [activeView]
  );
  // Reset comment caches only when the calendar changes — not on every gallery/calendar hop
  // (that wipe made every thumbnail badge flash `0` until the next snapshot).
  React.useEffect(() => {
    setPhotoCommentCounts({});
    setPreloadedPhotoComments({});
    setPreloadedPhotoCommentsReady(false);
  }, [activeCalId]);
  React.useEffect(() => {
    if (!activeCalId || !needsPhotoCommentCounts) return;
    const store = createPhotoCommentStore({
      calendarId: activeCalId, db: getFirebaseDb(), projectId: firebaseConfig.projectId,
      decodeDocument: firestoreDocumentToJs, fetchCountsRest: fetchPhotoCommentCountsRest,
      // Gallery thumbnails still need comment badges; keep bulk hydration on.
      enableBulkHydration: true
    });
    photoCommentStoreRef.current = store;
    const stop = store.start(state => {
      setPhotoCommentCounts(state.counts || {});
      setPreloadedPhotoComments(state.commentsByKey || {});
      setPreloadedPhotoCommentsReady(Boolean(state.ready));
    });
    return () => {
      stop();
      if (photoCommentStoreRef.current === store) photoCommentStoreRef.current = null;
    };
  }, [activeCalId, needsPhotoCommentCounts, firebaseDb, firebaseConnectionVersion]);

  return {
    galleryPhotoIndex,
    photoCommentCounts,
    setPhotoCommentCounts,
    preloadedPhotoComments,
    setPreloadedPhotoComments,
    preloadedPhotoCommentsReady,
    photoCommentStoreRef
  };
}
