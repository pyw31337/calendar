/**
 * In-browser file preview extraction for chat/memo file attachments.
 *
 * Nothing leaves the device: the file is fetched from its own Storage URL and parsed here.
 *   text / md / log / json / csv / tsv  -> text or a table (UTF-8, falls back to EUC-KR)
 *   rtf                                 -> plain text (control words stripped)
 *   docx / hwpx / odt                   -> paragraphs   (zip + XML, no library)
 *   xlsx / ods                          -> sheets as tables
 *   pptx / odp                          -> one text card per slide
 * Legacy binary Office (doc/xls/ppt/hwp) and anything else return { kind: 'none' }.
 *
 * Everything is regex/byte based (no DOMParser) so it also runs under plain Node for tests.
 */

export const PREVIEW_LIMITS = Object.freeze({
  paragraphs: 400,
  rows: 300,
  cols: 40,
  sheets: 8,
  slides: 60,
  textChars: 200000,
});

const TEXT_EXTS = ['txt', 'md', 'markdown', 'log', 'json', 'xml', 'yml', 'yaml', 'ini'];
const TABLE_TEXT_EXTS = ['csv', 'tsv'];
const ZIP_DOC_EXTS = ['docx', 'hwpx', 'odt'];
const ZIP_SHEET_EXTS = ['xlsx', 'ods'];
const ZIP_SLIDE_EXTS = ['pptx', 'odp'];
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif', 'svg'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'm4v'];
const AUDIO_EXTS = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'oga', 'flac'];

function extOf(attachment) {
  const raw = String(attachment?.ext || '').trim().toLowerCase();
  if (raw) return raw;
  const name = String(attachment?.name || '').split('?')[0];
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
}

/**
 * What kind of preview a file can get. 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'table'
 * | 'document' | 'sheet' | 'slides' | 'rtf' | 'none'.
 */
export function getFilePreviewKind(attachment) {
  const ext = extOf(attachment);
  const mime = String(attachment?.mime || '').toLowerCase();
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (IMAGE_EXTS.includes(ext) || (mime.startsWith('image/') && !/hei[cf]/.test(mime))) return 'image';
  if (VIDEO_EXTS.includes(ext) || mime.startsWith('video/')) return 'video';
  if (AUDIO_EXTS.includes(ext) || mime.startsWith('audio/')) return 'audio';
  if (TABLE_TEXT_EXTS.includes(ext) || mime === 'text/csv' || mime === 'text/tab-separated-values') return 'table';
  if (ext === 'rtf' || mime.includes('rtf')) return 'rtf';
  if (ZIP_DOC_EXTS.includes(ext)) return 'document';
  if (ZIP_SHEET_EXTS.includes(ext)) return 'sheet';
  if (ZIP_SLIDE_EXTS.includes(ext)) return 'slides';
  if (TEXT_EXTS.includes(ext) || mime.startsWith('text/') || mime === 'application/json') return 'text';
  return 'none';
}

/** Kinds that need the file's bytes parsed here (vs. handed straight to <img>/<video>/<iframe>). */
export function isExtractedPreviewKind(kind) {
  return ['text', 'table', 'rtf', 'document', 'sheet', 'slides'].includes(kind);
}

/* ---------------- text decoding ---------------- */

export function decodeTextBytes(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (typeof TextDecoder === 'undefined') return '';
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(view);
  } catch (_) {
    // Korean Excel/Notepad still save CSV/TXT as CP949 by default.
    try { return new TextDecoder('euc-kr').decode(view); } catch (__) {}
    return new TextDecoder('utf-8').decode(view);
  }
}

/* ---------------- CSV ---------------- */

export function detectDelimiter(text) {
  const firstLine = String(text || '').split(/\r?\n/, 1)[0] || '';
  const counts = { ',': 0, '\t': 0, ';': 0 };
  let quoted = false;
  for (const ch of firstLine) {
    if (ch === '"') quoted = !quoted;
    else if (!quoted && ch in counts) counts[ch] += 1;
  }
  return Object.keys(counts).reduce((best, key) => (counts[key] > counts[best] ? key : best), ',');
}

export function parseDelimited(text, { delimiter, maxRows = PREVIEW_LIMITS.rows, maxCols = PREVIEW_LIMITS.cols } = {}) {
  const src = String(text || '').replace(/^\uFEFF/, '');
  const delim = delimiter || detectDelimiter(src);
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  let truncated = false;
  const pushCell = () => { if (row.length < maxCols) row.push(cell); cell = ''; };
  const pushRow = () => {
    pushCell();
    if (!(row.length === 1 && row[0] === '')) rows.push(row);
    row = [];
  };
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"' && cell === '') quoted = true;
    else if (ch === delim) pushCell();
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      pushRow();
      if (rows.length >= maxRows) { truncated = i < src.length - 1; break; }
    } else cell += ch;
  }
  if (rows.length < maxRows && (cell !== '' || row.length > 0)) pushRow();
  return { rows, truncated };
}

/* ---------------- RTF ---------------- */

export function rtfToText(rtf) {
  let src = String(rtf || '');
  // Drop destination groups that are not body text (font/colour tables, pictures, metadata).
  src = src.replace(/\{\\\*[^{}]*\}/g, '')
    .replace(/\{\\(fonttbl|colortbl|stylesheet|info|pict|header|footer)[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, '');
  src = src.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\u(-?\d+)\??/g, (_, n) => {
      const code = Number(n) < 0 ? Number(n) + 65536 : Number(n);
      return String.fromCharCode(code);
    })
    .replace(/\\(par|line)\b ?/g, '\n')
    .replace(/\\tab\b ?/g, '\t')
    .replace(/\\[a-zA-Z]+-?\d* ?/g, '')
    .replace(/\\([{}\\])/g, '$1')
    .replace(/[{}]/g, '');
  return src.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

/* ---------------- zip ---------------- */

function u16(b, o) { return b[o] | (b[o + 1] << 8); }
function u32(b, o) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0; }

export function readZipDirectory(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i -= 1) {
    if (u32(b, i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not-zip');
  const count = u16(b, eocd + 10);
  let p = u32(b, eocd + 16);
  const entries = new Map();
  const nameDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;
  for (let n = 0; n < count && p + 46 <= b.length; n += 1) {
    if (u32(b, p) !== 0x02014b50) break;
    const method = u16(b, p + 10);
    const compressedSize = u32(b, p + 20);
    const nameLen = u16(b, p + 28);
    const extraLen = u16(b, p + 30);
    const commentLen = u16(b, p + 32);
    const localOffset = u32(b, p + 42);
    const nameBytes = b.subarray(p + 46, p + 46 + nameLen);
    const name = nameDecoder ? nameDecoder.decode(nameBytes) : String.fromCharCode(...nameBytes);
    entries.set(name, { method, compressedSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return { bytes: b, entries };
}

async function inflateRaw(data) {
  if (typeof DecompressionStream === 'undefined') throw new Error('no-decompression');
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function readZipText(zip, name) {
  const entry = zip.entries.get(name);
  if (!entry) return null;
  const b = zip.bytes;
  const o = entry.localOffset;
  if (u32(b, o) !== 0x04034b50) return null;
  const start = o + 30 + u16(b, o + 26) + u16(b, o + 28);
  const raw = b.subarray(start, start + entry.compressedSize);
  let data;
  if (entry.method === 0) data = raw;
  else if (entry.method === 8) data = await inflateRaw(raw);
  else return null;
  return new TextDecoder('utf-8').decode(data);
}

/* ---------------- XML text helpers ---------------- */

export function decodeXmlEntities(text) {
  return String(text || '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function blocks(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?(?:/>|>([\\s\\S]*?)</${tag}>)`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(xml))) out.push({ inner: m[1] || '', open: m[0].slice(0, m[0].indexOf('>') + 1) });
  return out;
}

function runsText(xml, textTag, { tabTag, breakTag } = {}) {
  let src = String(xml || '');
  if (tabTag) src = src.replace(new RegExp(`<${tabTag}\\s*/>`, 'g'), `<${textTag}>\t</${textTag}>`);
  if (breakTag) src = src.replace(new RegExp(`<${breakTag}(?:\\s[^>]*)?/>`, 'g'), `<${textTag}>\n</${textTag}>`);
  return blocks(src, textTag).map(r => decodeXmlEntities(r.inner.replace(/<[^>]+>/g, ''))).join('');
}

function stripTags(xml) {
  return decodeXmlEntities(String(xml || '').replace(/<[^>]+>/g, ''));
}

function attr(openTag, name) {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(openTag || '');
  return m ? decodeXmlEntities(m[1]) : null;
}

function numberedNames(zip, re) {
  return [...zip.entries.keys()]
    .map(name => ({ name, m: re.exec(name) }))
    .filter(x => x.m)
    .sort((a, b) => Number(a.m[1]) - Number(b.m[1]))
    .map(x => x.name);
}

/* ---------------- per-format extraction ---------------- */

function colIndex(ref) {
  const letters = /^[A-Z]+/.exec(String(ref || ''))?.[0] || '';
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return Math.max(0, n - 1);
}

async function extractDocx(zip) {
  const xml = await readZipText(zip, 'word/document.xml');
  if (xml == null) return null;
  const paragraphs = blocks(xml, 'w:p')
    .map(p => runsText(p.inner, 'w:t', { tabTag: 'w:tab', breakTag: 'w:br' }))
    .slice(0, PREVIEW_LIMITS.paragraphs);
  return { kind: 'document', paragraphs: trimTrailingEmpty(paragraphs) };
}

async function extractHwpx(zip) {
  const names = numberedNames(zip, /^Contents\/section(\d+)\.xml$/);
  const paragraphs = [];
  for (const name of names) {
    const xml = await readZipText(zip, name);
    if (xml == null) continue;
    blocks(xml, 'hp:p').forEach(p => {
      if (paragraphs.length < PREVIEW_LIMITS.paragraphs) paragraphs.push(runsText(p.inner, 'hp:t', { tabTag: 'hp:tab', breakTag: 'hp:lineBreak' }));
    });
    if (paragraphs.length >= PREVIEW_LIMITS.paragraphs) break;
  }
  return { kind: 'document', paragraphs: trimTrailingEmpty(paragraphs) };
}

function odfParagraphs(xml) {
  const body = /<office:body>([\s\S]*)<\/office:body>/.exec(xml)?.[1] || xml;
  const out = [];
  const re = /<text:(p|h)(?:\s[^>]*)?(?:\/>|>([\s\S]*?)<\/text:\1>)/g;
  let m;
  while ((m = re.exec(body)) && out.length < PREVIEW_LIMITS.paragraphs) {
    out.push(stripTags(String(m[2] || '').replace(/<text:tab\s*\/>/g, '\t').replace(/<text:line-break\s*\/>/g, '\n')));
  }
  return out;
}

async function extractOdt(zip) {
  const xml = await readZipText(zip, 'content.xml');
  if (xml == null) return null;
  return { kind: 'document', paragraphs: trimTrailingEmpty(odfParagraphs(xml)) };
}

async function extractXlsx(zip) {
  const shared = [];
  const sharedXml = await readZipText(zip, 'xl/sharedStrings.xml');
  if (sharedXml) blocks(sharedXml, 'si').forEach(si => shared.push(runsText(si.inner, 't')));
  const workbook = (await readZipText(zip, 'xl/workbook.xml')) || '';
  const sheetNames = blocks(workbook, 'sheet').map(s => attr(s.open, 'name')).filter(Boolean);
  const files = numberedNames(zip, /^xl\/worksheets\/sheet(\d+)\.xml$/).slice(0, PREVIEW_LIMITS.sheets);
  const sheets = [];
  for (let i = 0; i < files.length; i += 1) {
    const xml = await readZipText(zip, files[i]);
    if (xml == null) continue;
    const rows = [];
    let truncated = false;
    for (const row of blocks(xml, 'row')) {
      if (rows.length >= PREVIEW_LIMITS.rows) { truncated = true; break; }
      const cells = [];
      blocks(row.inner, 'c').forEach(c => {
        const col = colIndex(attr(c.open, 'r'));
        if (col >= PREVIEW_LIMITS.cols) return;
        const type = attr(c.open, 't');
        const v = /<v>([\s\S]*?)<\/v>/.exec(c.inner)?.[1];
        let value = '';
        if (type === 's') value = shared[Number(v)] ?? '';
        else if (type === 'inlineStr') value = runsText(c.inner, 't');
        else if (v != null) value = decodeXmlEntities(v);
        while (cells.length < col) cells.push('');
        cells[col] = value;
      });
      rows.push(cells);
    }
    sheets.push({ name: sheetNames[i] || `시트${i + 1}`, rows: trimEmptyRows(rows), truncated });
  }
  return { kind: 'sheet', sheets };
}

async function extractOds(zip) {
  const xml = await readZipText(zip, 'content.xml');
  if (xml == null) return null;
  const sheets = blocks(xml, 'table:table').slice(0, PREVIEW_LIMITS.sheets).map((t, i) => {
    const rows = [];
    blocks(t.inner, 'table:table-row').forEach(r => {
      if (rows.length >= PREVIEW_LIMITS.rows) return;
      const cells = [];
      blocks(r.inner, 'table:table-cell').forEach(c => {
        const repeat = Math.min(Number(attr(c.open, 'table:number-columns-repeated')) || 1, PREVIEW_LIMITS.cols);
        const value = odfParagraphs(c.inner).join('\n');
        for (let k = 0; k < repeat && cells.length < PREVIEW_LIMITS.cols; k += 1) cells.push(value);
      });
      rows.push(trimTrailingEmpty(cells));
    });
    return { name: attr(t.open, 'table:name') || `시트${i + 1}`, rows: trimEmptyRows(rows), truncated: false };
  });
  return { kind: 'sheet', sheets };
}

async function extractPptx(zip) {
  const files = numberedNames(zip, /^ppt\/slides\/slide(\d+)\.xml$/).slice(0, PREVIEW_LIMITS.slides);
  const slides = [];
  for (const name of files) {
    const xml = await readZipText(zip, name);
    if (xml == null) continue;
    slides.push(blocks(xml, 'a:p').map(p => runsText(p.inner, 'a:t', { breakTag: 'a:br' })).filter(line => line.trim()));
  }
  return { kind: 'slides', slides };
}

async function extractOdp(zip) {
  const xml = await readZipText(zip, 'content.xml');
  if (xml == null) return null;
  const slides = blocks(xml, 'draw:page').slice(0, PREVIEW_LIMITS.slides)
    .map(page => odfParagraphs(page.inner).filter(line => line.trim()));
  return { kind: 'slides', slides };
}

function trimTrailingEmpty(list) {
  const out = list.slice();
  while (out.length && !String(out[out.length - 1] || '').trim()) out.pop();
  return out;
}

function trimEmptyRows(rows) {
  return trimTrailingEmpty(rows.map(r => r.map(c => c ?? ''))
    .map(r => (r.some(c => String(c).trim()) ? r : [''])))
    .map(r => (r.length === 1 && r[0] === '' ? [] : r));
}

/**
 * Parse already-downloaded bytes into a preview model.
 * Returns one of:
 *   { kind: 'text', text, truncated }        { kind: 'table', rows, truncated }
 *   { kind: 'document', paragraphs }        { kind: 'sheet', sheets: [{ name, rows, truncated }] }
 *   { kind: 'slides', slides: [[line]] }    { kind: 'none' }
 */
export async function extractFilePreview(attachment, bytes) {
  const kind = getFilePreviewKind(attachment);
  const ext = extOf(attachment);
  if (kind === 'text' || kind === 'rtf') {
    let text = decodeTextBytes(bytes);
    if (kind === 'rtf') text = rtfToText(text);
    else if (ext === 'json') {
      try { text = JSON.stringify(JSON.parse(text), null, 2); } catch (_) {}
    }
    const truncated = text.length > PREVIEW_LIMITS.textChars;
    return { kind: 'text', text: truncated ? text.slice(0, PREVIEW_LIMITS.textChars) : text, truncated };
  }
  if (kind === 'table') {
    const text = decodeTextBytes(bytes);
    const parsed = parseDelimited(text, ext === 'tsv' ? { delimiter: '\t' } : {});
    return { kind: 'table', rows: parsed.rows, truncated: parsed.truncated };
  }
  if (kind === 'document' || kind === 'sheet' || kind === 'slides') {
    const zip = readZipDirectory(bytes);
    const extractor = {
      docx: extractDocx, hwpx: extractHwpx, odt: extractOdt,
      xlsx: extractXlsx, ods: extractOds, pptx: extractPptx, odp: extractOdp,
    }[ext];
    const result = extractor ? await extractor(zip) : null;
    return result || { kind: 'none' };
  }
  return { kind: 'none' };
}

/** A few lines of plain text for the inline card under a file name. */
export function summarizeFilePreview(model, maxLines = 4) {
  if (!model) return '';
  const lines = [];
  if (model.kind === 'text') lines.push(...String(model.text || '').split(/\r?\n/));
  else if (model.kind === 'document') lines.push(...model.paragraphs);
  else if (model.kind === 'slides') model.slides.forEach(s => lines.push(...s));
  else if (model.kind === 'table') model.rows.forEach(r => lines.push(r.filter(Boolean).join(' · ')));
  else if (model.kind === 'sheet') (model.sheets[0]?.rows || []).forEach(r => lines.push(r.filter(Boolean).join(' · ')));
  return lines.map(l => String(l || '').trim()).filter(Boolean).slice(0, maxLines).join('\n');
}
