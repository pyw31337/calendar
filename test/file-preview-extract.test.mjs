import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import { Buffer } from 'node:buffer';
import { TextEncoder } from 'node:util';

const {
  getFilePreviewKind, extractFilePreview, parseDelimited, rtfToText, decodeTextBytes, summarizeFilePreview,
} = await import('../src/core/file-preview-extract.js');

// Minimal zip writer (deflate for every entry) -- enough to exercise the reader.
function makeZip(files) {
  const enc = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = enc.encode(name);
    const data = deflateRawSync(Buffer.from(content, 'utf8'));
    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt16LE(nameBytes.length, 26);
    Buffer.from(nameBytes).copy(local, 30);
    const central = Buffer.alloc(46 + nameBytes.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    Buffer.from(nameBytes).copy(central, 46);
    locals.push(local, data);
    centrals.push(central);
    offset += local.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(centrals.length, 8);
  eocd.writeUInt16LE(centrals.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

test('preview kind by extension / mime', () => {
  assert.equal(getFilePreviewKind({ name: 'a.PDF' }), 'pdf');
  assert.equal(getFilePreviewKind({ name: 'a.png' }), 'image');
  assert.equal(getFilePreviewKind({ name: 'a.heic', mime: 'image/heic' }), 'none');
  assert.equal(getFilePreviewKind({ name: 'a.csv' }), 'table');
  assert.equal(getFilePreviewKind({ name: 'a.docx' }), 'document');
  assert.equal(getFilePreviewKind({ name: 'a.hwpx' }), 'document');
  assert.equal(getFilePreviewKind({ name: 'a.xlsx' }), 'sheet');
  assert.equal(getFilePreviewKind({ name: 'a.pptx' }), 'slides');
  assert.equal(getFilePreviewKind({ name: 'a.md' }), 'text');
  assert.equal(getFilePreviewKind({ name: 'a.doc' }), 'none');
});

test('csv parsing handles quotes, embedded delimiters and CRLF', () => {
  const { rows } = parseDelimited('이름,메모\r\n"박, 서준","말 ""안녕"""\r\n유리,\n');
  assert.deepEqual(rows, [['이름', '메모'], ['박, 서준', '말 "안녕"'], ['유리', '']]);
  assert.deepEqual(parseDelimited('a;b;c\n1;2;3').rows[1], ['1', '2', '3']);
});

test('EUC-KR text falls back when not valid UTF-8', () => {
  const eucKr = new Uint8Array([0xc7, 0xd1, 0xb1, 0xdb]); // "한글"
  assert.equal(decodeTextBytes(eucKr), '한글');
  assert.equal(decodeTextBytes(new TextEncoder().encode('모여라')), '모여라');
});

test('rtf control words are stripped', () => {
  const text = rtfToText('{\\rtf1\\ansi{\\fonttbl{\\f0 Arial;}}\\f0 Hello\\par World \\u54620?}');
  assert.equal(text, 'Hello\nWorld 한');
});

test('docx paragraphs', async () => {
  const zip = makeZip({
    'word/document.xml': '<w:document><w:body><w:p><w:r><w:t>첫 줄</w:t></w:r><w:r><w:t xml:space="preserve"> &amp; 끝</w:t></w:r></w:p><w:p/><w:p><w:r><w:t>둘</w:t><w:tab/><w:t>셋</w:t></w:r></w:p></w:body></w:document>',
  });
  const model = await extractFilePreview({ name: 'a.docx' }, zip);
  assert.equal(model.kind, 'document');
  assert.deepEqual(model.paragraphs, ['첫 줄 & 끝', '', '둘\t셋']);
  assert.equal(summarizeFilePreview(model), '첫 줄 & 끝\n둘\t셋');
});

test('xlsx shared strings, numbers and sparse columns', async () => {
  const zip = makeZip({
    'xl/workbook.xml': '<workbook><sheets><sheet name="정산" sheetId="1"/></sheets></workbook>',
    'xl/sharedStrings.xml': '<sst><si><t>항목</t></si><si><r><t>금</t></r><r><t>액</t></r></si><si><t>커피</t></si></sst>',
    'xl/worksheets/sheet1.xml': '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="C1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="C2"><v>4500</v></c></row></sheetData></worksheet>',
  });
  const model = await extractFilePreview({ name: 'a.xlsx' }, zip);
  assert.equal(model.kind, 'sheet');
  assert.equal(model.sheets[0].name, '정산');
  assert.deepEqual(model.sheets[0].rows, [['항목', '', '금액'], ['커피', '', '4500']]);
});

test('pptx slides in numeric order', async () => {
  const zip = makeZip({
    'ppt/slides/slide10.xml': '<p:sld><a:p><a:r><a:t>열</a:t></a:r></a:p></p:sld>',
    'ppt/slides/slide2.xml': '<p:sld><a:p><a:r><a:t>둘</a:t></a:r></a:p><a:p><a:r><a:t>둘-2</a:t></a:r></a:p></p:sld>',
  });
  const model = await extractFilePreview({ name: 'a.pptx' }, zip);
  assert.deepEqual(model.slides, [['둘', '둘-2'], ['열']]);
});

test('hwpx sections', async () => {
  const zip = makeZip({
    'Contents/section0.xml': '<hs:sec><hp:p><hp:run><hp:t>한글 문서</hp:t></hp:run></hp:p></hs:sec>',
  });
  const model = await extractFilePreview({ name: 'a.hwpx' }, zip);
  assert.deepEqual(model.paragraphs, ['한글 문서']);
});

test('non-zip office bytes fail loudly (caller shows the fallback)', async () => {
  await assert.rejects(() => extractFilePreview({ name: 'a.docx' }, new Uint8Array([1, 2, 3])));
});
