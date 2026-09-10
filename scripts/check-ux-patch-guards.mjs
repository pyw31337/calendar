/**
 * Lightweight guards for composer/place/movie/file UX patches (no Firebase).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import { GATHER_APP_UTILS } from "../src/core/app-utils.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");


const utils = GATHER_APP_UTILS;
assert.equal(typeof utils.doesPlaceMatchDate, "function", "doesPlaceMatchDate exported");

assert.equal(
  utils.doesPlaceMatchDate({ visitStatus: "planned", visitDate: "", memo: "맛집 후보" }, "2026-09-09"),
  false,
  "undated planned without visitDate"
);
assert.equal(
  utils.doesPlaceMatchDate({ visitStatus: "planned", visitDate: "2026-09-09", memo: "맛집 후보" }, "2026-09-09"),
  false,
  "undated planned with stale visitDate"
);
assert.equal(
  utils.doesPlaceMatchDate({ visitStatus: "planned", visitDate: "", memo: "" }, "2026-09-09"),
  false,
  "empty memo planned"
);
assert.equal(
  utils.doesPlaceMatchDate({ visitStatus: "visited", visitDate: "2026-09-09", memo: "26.09.09 점심" }, "2026-09-09"),
  true,
  "dated memo match"
);
assert.equal(
  utils.doesPlaceMatchDate({ visitStatus: "visited", visitDate: "2026-09-09", memo: "26.09.09 점심" }, "2026-09-10"),
  false,
  "other day no match"
);
assert.equal(utils.derivePlaceVisitStatus({ memo: "그냥 메모" }), "planned");
assert.equal(utils.getPlaceMemoEntryForDate("그냥 메모", "2026-09-09"), "");
assert.equal(utils.getPlaceMemoEntryForDate("26.09.09 점심", "2026-09-09"), "점심");

const gallery = fs.readFileSync(path.join(root, "src/ui/ui-summary-gallery.js"), "utf8");
assert.match(gallery, /category === \x27movie\x27/);
assert.match(gallery, /isNowShowing/);
assert.match(gallery, /localeCompare\(bDay\)/);

const chatRoom = fs.readFileSync(path.join(root, "src/ui/ui-chat-room.js"), "utf8");
assert.doesNotMatch(chatRoom, /title: "사진 첨부"/);
assert.match(chatRoom, /title: "파일 업로드"/);
assert.match(chatRoom, /lucide-paperclip/);
assert.doesNotMatch(chatRoom, /fileInputRefChat/);

const editModal = fs.readFileSync(path.join(root, "src/ui/ui-calendar-core.js"), "utf8");
assert.doesNotMatch(editModal, /title: "사진 첨부"/);
assert.match(editModal, /title: "파일 업로드"/);

const files = fs.readFileSync(path.join(root, "src/ui/ui-chat-files.js"), "utf8");
assert.match(files, /overflowWrap: "anywhere"/);
assert.match(files, /usePdfPreviewUrl/);
assert.match(files, /createObjectURL/);
assert.match(files, /revokeObjectURL/);

const lightbox = fs.readFileSync(path.join(root, "src/ui/ui-lightbox.js"), "utf8");
assert.match(lightbox, /keepTagFocusRef/);
assert.match(lightbox, /refocusComposerField\(tagInputRef\)/);
assert.match(lightbox, /refocusComposerField\(commentInputRef\)/);
assert.match(lightbox, /lightbox-content-chunk/);
assert.match(lightbox, /gap: '8px'/);
assert.match(lightbox, /42dvh/);

console.log("[ux-patch-guards] all checks passed");
