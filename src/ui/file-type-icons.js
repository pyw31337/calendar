/**
 * Extension → file-type SVG icon map (iconpacks Free File Types pack 271).
 * Icons live in public-vite/file-type-icons/ (served at BASE_URL/file-type-icons/).
 */

const FILE_TYPE_ICON_BASE =
  ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './')
    .replace(/\/?$/, '/');

export const FILE_TYPE_ICON_FALLBACK = 'coding-file-format-extension-24115.svg';
export const FILE_TYPE_ICON_IMAGE_FALLBACK = 'green-image-file-format-extension-24112.svg';

/** @type {Record<string, string>} */
export const FILE_TYPE_ICON_BY_EXT = Object.freeze({
  pdf: 'red-pdf-file-format-24084.svg',
  doc: 'blue-word-document-doc-24085.svg',
  docx: 'blue-word-document-docx-24086.svg',
  ppt: 'powerpoint-ppt-file-format-extension-24092.svg',
  pptx: 'powerpoint-ppt-file-format-extension-24092.svg',
  xls: 'green-xls-excel-file-format-extension-24090.svg',
  xlsx: 'green-xlsx-excel-file-format-extension-24091.svg',
  csv: 'green-csv-file-format-extension-24093.svg',
  txt: 'txt-file-format-extension-24095.svg',
  rtf: 'txt-file-format-extension-24095.svg',
  zip: 'yellow-zip-file-format-extension-24094.svg',
  rar: 'yellow-zip-file-format-extension-24094.svg',
  '7z': 'yellow-zip-file-format-extension-24094.svg',
  gz: 'yellow-zip-file-format-extension-24094.svg',
  tar: 'yellow-zip-file-format-extension-24094.svg',
  jpg: 'jpg-image-file-format-extension-24098.svg',
  jpeg: 'jpg-image-file-format-extension-24098.svg',
  png: 'png-image-file-format-extension-24099.svg',
  gif: 'red-gif-image-file-format-extension-24105.svg',
  webp: 'yellow-webp-file-format-extension-24106.svg',
  bmp: 'bmp-file-format-extension-yellow-24119.svg',
  tiff: 'blue-tiff-file-format-extension-24107.svg',
  tif: 'blue-tiff-file-format-extension-24107.svg',
  svg: 'red-svg-image-file-format-extension-24101.svg',
  ico: 'ico-file-format-extension-24109.svg',
  raw: 'raw-file-format-extension-24124.svg',
  heic: FILE_TYPE_ICON_IMAGE_FALLBACK,
  heif: FILE_TYPE_ICON_IMAGE_FALLBACK,
  avif: FILE_TYPE_ICON_IMAGE_FALLBACK,
  mp3: 'blue-mp3-music-file-format-extension-24096.svg',
  wav: 'music-file-format-extension-24114.svg',
  aac: 'music-file-format-extension-24114.svg',
  flac: 'music-file-format-extension-24114.svg',
  m4a: 'music-file-format-extension-24114.svg',
  ogg: 'music-file-format-extension-24114.svg',
  mp4: 'blue-mp4-file-format-extension-24097.svg',
  mov: 'red-video-file-format-extension-24113.svg',
  avi: 'red-video-file-format-extension-24113.svg',
  mkv: 'red-video-file-format-extension-24113.svg',
  webm: 'red-video-file-format-extension-24113.svg',
  json: 'json-file-format-extension-24121.svg',
  html: 'html-file-format-extension-24087.svg',
  htm: 'html-file-format-extension-24087.svg',
  css: 'css-file-format-extension-24100.svg',
  scss: 'sass-file-format-extension-24111.svg',
  sass: 'sass-file-format-extension-24111.svg',
  js: 'js-javascript-file-format-extension-24089.svg',
  mjs: 'js-javascript-file-format-extension-24089.svg',
  cjs: 'js-javascript-file-format-extension-24089.svg',
  ts: 'js-javascript-file-format-extension-24089.svg',
  jsx: 'js-javascript-file-format-extension-24089.svg',
  tsx: 'js-javascript-file-format-extension-24089.svg',
  py: 'blue-python-file-format-extension-24125.svg',
  java: 'ads-java-file-format-extension-24118.svg',
  xml: 'xml-file-format-extension-24120.svg',
  sql: 'sql-database-file-format-extension-24102.svg',
  log: 'blue-log-file-format-extension-24130.svg',
  exe: 'blue-exe-file-format-extension-24123.svg',
  apk: 'blue-apk-file-format-extension-24116.svg',
  sys: 'blue-sys-system-file-format-extension-24122.svg',
  ttf: 'ttf-file-format-extension-24110.svg',
  otf: 'ttf-file-format-extension-24110.svg',
  woff: 'ttf-file-format-extension-24110.svg',
  woff2: 'ttf-file-format-extension-24110.svg',
  ai: 'adobe-illustrator-ai-file-extension-24103.svg',
  eps: 'blue-eps-file-format-extension-24108.svg',
  psd: 'blue-psd-photoshop-file-format-extension-24126.svg',
  indd: 'adobe-indesign-file-format-extension-24117.svg',
  dwg: 'dwg-file-format-extension-24129.svg',
  cdr: 'green-cdr-core-draw-file-format-extension-24127.svg',
  gpx: 'green-gpx-gps-file-format-extension-24128.svg'
});

const IMAGE_MIME_PREFIX = 'image/';
const AUDIO_MIME_PREFIX = 'audio/';
const VIDEO_MIME_PREFIX = 'video/';

export function normalizeFileExt(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  const cleaned = raw.replace(/^\.+/, '');
  const parts = cleaned.split(/[./\\]/);
  return parts[parts.length - 1] || '';
}

export function resolveFileTypeIconFilename(attachmentOrExt) {
  if (typeof attachmentOrExt === 'string') {
    const ext = normalizeFileExt(attachmentOrExt);
    if (ext && FILE_TYPE_ICON_BY_EXT[ext]) return FILE_TYPE_ICON_BY_EXT[ext];
    return FILE_TYPE_ICON_FALLBACK;
  }

  const attachment = attachmentOrExt || {};
  const ext = normalizeFileExt(
    attachment.ext ||
    (typeof attachment.name === 'string' ? attachment.name.split('.').pop() : '') ||
    ''
  );
  if (ext && FILE_TYPE_ICON_BY_EXT[ext]) return FILE_TYPE_ICON_BY_EXT[ext];

  const mime = String(attachment.mime || attachment.type || '').toLowerCase();
  if (mime === 'application/pdf') return FILE_TYPE_ICON_BY_EXT.pdf;
  if (mime.includes('word')) return FILE_TYPE_ICON_BY_EXT.docx;
  if (mime.includes('presentation') || mime.includes('powerpoint')) return FILE_TYPE_ICON_BY_EXT.ppt;
  if (mime.includes('sheet') || mime.includes('excel')) return FILE_TYPE_ICON_BY_EXT.xlsx;
  if (mime === 'text/csv' || mime.includes('csv')) return FILE_TYPE_ICON_BY_EXT.csv;
  if (mime.startsWith('text/')) return FILE_TYPE_ICON_BY_EXT.txt;
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('archive')) {
    return FILE_TYPE_ICON_BY_EXT.zip;
  }
  if (mime.startsWith(IMAGE_MIME_PREFIX)) return FILE_TYPE_ICON_IMAGE_FALLBACK;
  if (mime.startsWith(AUDIO_MIME_PREFIX)) return 'music-file-format-extension-24114.svg';
  if (mime.startsWith(VIDEO_MIME_PREFIX)) return 'red-video-file-format-extension-24113.svg';
  if (mime.includes('json')) return FILE_TYPE_ICON_BY_EXT.json;
  if (mime.includes('javascript')) return FILE_TYPE_ICON_BY_EXT.js;
  if (mime.includes('html')) return FILE_TYPE_ICON_BY_EXT.html;
  if (mime.includes('css')) return FILE_TYPE_ICON_BY_EXT.css;

  return FILE_TYPE_ICON_FALLBACK;
}

export function resolveFileTypeIconUrl(attachmentOrExt) {
  const filename = resolveFileTypeIconFilename(attachmentOrExt);
  return `${FILE_TYPE_ICON_BASE}file-type-icons/${filename}`;
}

if (typeof window !== 'undefined') {
  window.GATHER_FILE_TYPE_ICONS = Object.assign({}, window.GATHER_FILE_TYPE_ICONS || {}, {
    FILE_TYPE_ICON_BY_EXT,
    FILE_TYPE_ICON_FALLBACK,
    FILE_TYPE_ICON_IMAGE_FALLBACK,
    normalizeFileExt,
    resolveFileTypeIconFilename,
    resolveFileTypeIconUrl
  });
}
