import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// Mock minimal window and React for testing isolated UI functions in Node
globalThis.window = {
  React: {
    createElement: (type, props, ...children) => ({
      type,
      props: {
        ...props,
        children: children.length === 1 ? children[0] : children.length > 1 ? children : undefined,
      },
    }),
  },
};

test('SectionCountBadge renders single-digit and multi-digit classes and data attributes', async () => {
  const { SectionCountBadge } = await import('../src/ui/ui-summary-gallery.js');

  // Single digit (0~9)
  const single = SectionCountBadge({ count: 5 });
  assert.equal(single.props['data-digits'], 'single');
  assert.ok(single.props.className.includes('is-single-digit'));
  assert.ok(!single.props.className.includes('is-multi-digit'));
  assert.equal(single.props.children, 5);

  // Multi digit (10+)
  const multi = SectionCountBadge({ count: 12 });
  assert.equal(multi.props['data-digits'], 'multi');
  assert.ok(multi.props.className.includes('is-multi-digit'));
  assert.ok(!multi.props.className.includes('is-single-digit'));
  assert.equal(multi.props.children, 12);

  // Large multi digit (100+)
  const large = SectionCountBadge({ count: 128 });
  assert.equal(large.props['data-digits'], 'multi');
  assert.ok(large.props.className.includes('is-multi-digit'));

  // Zero / non-numeric returns null
  assert.equal(SectionCountBadge({ count: 0 }), null);
  assert.equal(SectionCountBadge({ count: -1 }), null);
});

test('PhotoCommentCountBadge sets circle geometry for single digit and capsule geometry for multi digit', async () => {
  const { PhotoCommentCountBadge } = await import('../src/ui/ui-icons.js');

  // Single digit
  const single = PhotoCommentCountBadge({ count: 3 });
  assert.equal(single.props['data-digits'], 'single');
  assert.ok(single.props.className.includes('is-single-digit'));
  assert.equal(single.props.style.width, '22px');
  assert.equal(single.props.style.height, '22px');
  assert.equal(single.props.style.padding, '0');
  assert.equal(single.props.style.aspectRatio, '1 / 1');
  assert.equal(single.props.style.borderRadius, '9999px');

  // Multi digit
  const multi = PhotoCommentCountBadge({ count: 24 });
  assert.equal(multi.props['data-digits'], 'multi');
  assert.ok(multi.props.className.includes('is-multi-digit'));
  assert.equal(multi.props.style.width, 'auto');
  assert.equal(multi.props.style.height, '22px');
  assert.equal(multi.props.style.padding, '0 5.5px');
  assert.equal(multi.props.style.aspectRatio, 'auto');
  assert.equal(multi.props.style.borderRadius, '9999px');
});

test('CSS enforces 1:1 circle for single-digit and capsule (9999px) for multi-digit without ellipse distortion', async () => {
  const destChrome = await fs.readFile(new URL('../src/ui/v2/dest-chrome-late.css', import.meta.url), 'utf8');
  const responsiveAudit = await fs.readFile(new URL('../src/ui/v2/responsive-audit.css', import.meta.url), 'utf8');
  const appCss = await fs.readFile(new URL('../src/app.css', import.meta.url), 'utf8');

  // Verify dest-chrome-late.css has dedicated numeric count badge block with border-radius: 9999px
  assert.ok(
    destChrome.includes('Numeric Count Badges: Single-digit Circle (1:1) / Multi-digit Capsule (Pill)'),
    'dest-chrome-late.css must include dedicated Numeric Count Badges geometry block'
  );
  assert.ok(
    destChrome.includes('aspect-ratio: 1 / 1 !important;'),
    'Single digit count badges must have 1:1 aspect-ratio for perfect circle'
  );
  assert.ok(
    destChrome.includes('padding: 0 5.5px !important;'),
    'Multi-digit count badges must have horizontal padding for capsule expansion'
  );

  // Verify responsive-audit.css no longer forces fixed width or flex on section-count-badge
  assert.ok(
    !responsiveAudit.includes('flex: 0 0 var(--v2-badge-min-height, 20px) !important;'),
    'responsive-audit.css must not lock section-count-badge to rigid 20px flex basis'
  );
  assert.ok(
    responsiveAudit.includes('.renewal-shell.v2-design .section-count-badge.is-multi-digit'),
    'responsive-audit.css must support .is-multi-digit capsule expansion'
  );

  // Verify app.css rules
  assert.ok(
    appCss.includes('.section-count-badge:is([data-digits="single"]'),
    'app.css must provide single-digit 1:1 circle rule for section-count-badge'
  );
  assert.ok(
    appCss.includes('.section-count-badge:is([data-digits="multi"]'),
    'app.css must provide multi-digit capsule rule for section-count-badge'
  );
  assert.ok(
    appCss.includes('.main-menu-badge:is([data-digits="single"]'),
    'app.css must provide single-digit circle rule for main-menu-badge'
  );
  assert.ok(
    appCss.includes('.region-filter-chip-count:is([data-digits="single"]'),
    'app.css must provide single-digit circle rule for region-filter-chip-count'
  );
});
