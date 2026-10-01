import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const gallery = readFileSync(new URL('../src/ui/ui-summary-gallery.js', import.meta.url), 'utf8');
const late = readFileSync(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8');

test('memory detail header stacks a wrapping title over an unbreakable date', () => {
  const start = gallery.indexOf('className: "archive-memory-detail-head"');
  const end = gallery.indexOf('renderPhotoThumbGrid(group.photos', start);
  const head = gallery.slice(start, end);
  assert.ok(start > 0 && end > start, 'memory detail head is present');

  const titleAt = head.indexOf('archive-memory-detail-title"');
  const dateRowAt = head.indexOf('archive-memory-detail-date-row');
  const dateAt = head.indexOf('archive-memory-detail-date"');
  assert.ok(head.includes('archive-memory-detail-title-row'), 'title sits on its own row');
  assert.ok(titleAt > 0 && dateRowAt > titleAt && dateAt > dateRowAt, 'date follows the title on the next row');

  const titleSpan = head.slice(titleAt, dateRowAt);
  assert.match(titleSpan, /whiteSpace:\s*'normal'/);
  assert.doesNotMatch(titleSpan, /textOverflow:\s*'ellipsis'/);

  const dateSpan = head.slice(dateAt, dateAt + 600);
  assert.match(dateSpan, /whiteSpace:\s*'nowrap'/);
  assert.match(dateSpan, /minWidth:\s*'max-content'/);
  assert.match(dateSpan, /textOverflow:\s*'clip'/);
  assert.doesNotMatch(dateSpan, /textOverflow:\s*'ellipsis'/);
  assert.match(head, /paddingLeft:\s*'40px'/);

  const block = late.slice(late.indexOf('Archive memory detail header'));
  assert.ok(block.length > 0, 'header comment marks the rule block');
  assert.match(block, /\.archive-memory-detail-head \{[\s\S]*?flex-direction:\s*column !important;/);
  assert.match(block, /\.archive-memory-detail-title \{[\s\S]*?white-space:\s*normal !important;/);
  assert.match(block, /\.archive-memory-detail-date \{[\s\S]*?white-space:\s*nowrap !important;/);
  assert.match(block, /\.archive-memory-detail-date \{[\s\S]*?min-width:\s*max-content !important;/);
  assert.match(block, /\.archive-memory-detail-date \{[\s\S]*?text-overflow:\s*clip !important;/);
  assert.match(block, /\.archive-memory-detail-date-row \{[\s\S]*?padding-left:\s*40px !important;/);
  assert.doesNotMatch(
    block.slice(0, block.indexOf('.archive-detail-title {')),
    /\.archive-memory-detail-title,\s*\.archive-memory-detail-date/
  );
});
