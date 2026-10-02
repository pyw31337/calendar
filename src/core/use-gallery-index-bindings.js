// U12 (docs/app-main-split-units.md): the gallery index bindings, moved out of CalendarApp.
// Two server-side indexes feed the photo surfaces (calendar album, gallery, 보관함, lightbox):
//   - the photoIndex (useGalleryPhotoIndex): the paged, CF-maintained photo list and its tags;
//   - photo comment counts (thumbnail badges): one summary document the onPhotoCommentItemWrite
//     function keeps (core/photo-comment-items.js). The lightbox reads each photo's comments
//     live on its own; nothing here caches comment bodies any more.
// CalendarApp still owns everything that writes through them (tag saves via
// app-image-tag-save.js, photo delete's galleryPhotoIndex.patchItems).
import { useGalleryPhotoIndex } from './photo-index.js';
import { subscribePhotoCommentCounts } from './photo-comment-items.js';
import { firebaseConfig, firestoreDocumentToJs } from './app-firebase-data.js';

export function useGalleryIndexBindings({
  React,
  activeCalId,
  activeView,
  firebaseDb,
  firebaseConnectionVersion
}) {
  // { [assetKey]: live comment count } -- exactly what the lightbox shows for that photo.
  const [photoCommentCounts, setPhotoCommentCounts] = React.useState({});

  const galleryPhotoIndex = useGalleryPhotoIndex({
    React, calendarId: activeCalId, activeView,
    projectId: firebaseConfig.projectId, decodeDocument: firestoreDocumentToJs
  });

  React.useEffect(() => {
    setPhotoCommentCounts({});
    if (!activeCalId) return undefined;
    return subscribePhotoCommentCounts({ calendarId: activeCalId, onChange: setPhotoCommentCounts });
  }, [activeCalId, firebaseDb, firebaseConnectionVersion]);

  return {
    galleryPhotoIndex,
    photoCommentCounts
  };
}
