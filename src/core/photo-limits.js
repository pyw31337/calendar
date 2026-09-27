// Photo upload / tag limits, shared by every upload and tag-save path.
//
// One chat/gallery/meeting message holds at most MAX_PHOTOS_PER_MESSAGE photos (firestore.rules
// caps imageUrls / imageTags / imageTagMap at 50), so a bigger upload is split into several
// messages (chunkResolvedImagesForMessages). A single upload may pick up to MAX_UPLOAD_PHOTOS.
export const MAX_UPLOAD_PHOTOS = 200;
export const MAX_PHOTOS_PER_MESSAGE = 50;
// Per-photo tags: up to MAX_PHOTO_TAGS tokens of <= 30 chars, stored as one space-joined string.
export const MAX_PHOTO_TAGS = 20;
export const MAX_PHOTO_TAG_TOKEN = 30;
export const MAX_PHOTO_TAG_TEXT = MAX_PHOTO_TAGS * (MAX_PHOTO_TAG_TOKEN + 1);
