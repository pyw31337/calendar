// Real gallery UI with isolated Firestore/command fixtures. No production reads or writes.
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';

const base = process.env.AI_GALLERY_SMOKE_URL || 'http://127.0.0.1:4189';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local app server required');
const engine = process.env.CALENDAR_SMOKE_BROWSER || 'chromium';
const browser = await ({ chromium, firefox, webkit }[engine]).launch();
const encode = value => value == null ? { nullValue: null }
  : Array.isArray(value) ? { arrayValue: { values: value.map(encode) } }
  : typeof value === 'object' ? { mapValue: { fields: fields(value) } }
  : typeof value === 'number' ? { integerValue: String(value) }
  : typeof value === 'boolean' ? { booleanValue: value } : { stringValue: value };
const fields = value => Object.fromEntries(Object.entries(value).map(([key, child]) => [key, encode(child)]));
const assetKey = 'asset:v1:ai-review-fixture';
try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: 'Asia/Seoul', serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    const commands = [];
    const reviews = [];
    let tags = '영우 경기도';
    const photo = () => ({ assetKey, tags, full: base + '/__fixture-photo.svg', thumb: base + '/__fixture-photo.svg',
      personTags: ['영우'], placeTags: ['경기도'], source: 'chat', messageId: 'fixture-message', imageIndex: 0 });
    const item = { assetKey, status: 'suggested', analysisVersion: 5, suggestedTags: ['박영우', '광명시'],
      review: { decision: 'applied', finalTags: ['박영우', '광명시'] } };
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === base) {
        if (url.pathname === '/__fixture-photo.svg') return route.fulfill({ contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#7350dc"/></svg>' });
        return route.continue();
      }
      if (url.hostname === 'firestore.googleapis.com') {
        if (url.pathname.includes('/photoIndex/')) return route.fulfill({ json: { name: 'cal_cw/photoIndex/' + assetKey, fields: fields(photo()) } });
        if (url.pathname.endsWith(':runQuery')) {
          const query = request.postDataJSON()?.structuredQuery;
          return route.fulfill({ json: query?.from?.[0]?.collectionId === 'mediaAnalysis'
            ? [{ document: { name: 'cal_cw/mediaAnalysis/fixture', fields: fields(item) } }] : [] });
        }
        return route.abort();
      }
      if (url.hostname.endsWith('.cloudfunctions.net')) {
        if (url.pathname === '/mediaCommand') {
          const body = request.postDataJSON();
          commands.push(body);
          assert.equal(body.calendarId, 'cw');
          tags = body.items[0].tags;
          return route.fulfill({ json: { ok: true, sourceDocumentsTouched: 1 } });
        }
        if (url.pathname === '/recordMediaAnalysisFeedback') {
          const body = request.postDataJSON();
          reviews.push(body);
          item.review = { decision: body.decision, finalTags: body.finalTags };
          return route.fulfill({ json: { ok: true, review: item.review } });
        }
        return route.abort();
      }
      // Only public SDK assets are allowed off-origin. Auth and all other remote APIs are blocked.
      if (request.method() === 'GET' && ['www.gstatic.com', 'cdnjs.cloudflare.com'].includes(url.hostname)) return route.continue();
      return route.abort();
    });
    await page.goto(base + '/?id=cw&view=gallery');
    await page.waitForFunction(() => window.__GATHER_BOOT_READY__ === true);
    await page.getByRole('button', { name: 'AI 분석', exact: true }).click();
    await page.getByRole('button', { name: /^검토 완료/ }).first().click();
    await page.getByText('인물 인식: 영우', { exact: false }).waitFor();
    await page.getByRole('button', { name: '다시 수정', exact: true }).click();
    const input = page.getByPlaceholder('적용할 태그를 공백 또는 쉼표로 구분 (#서준 #콘소넌스 #250615)');
    await input.waitFor();
    assert.equal(await input.inputValue(), '#영우 #경기도', 'review history must not restore removed canonical tags');
    await input.fill('#영우');
    await page.getByRole('button', { name: '수정 적용', exact: true }).click();
    await page.getByRole('button', { name: '다시 수정', exact: true }).waitFor();
    assert.equal(commands.length, 1);
    assert.equal(commands[0].items[0].tags, '영우', 'manual deletion must survive the canonical write');
    assert.equal(reviews.length, 1);
    assert.deepEqual(reviews[0].finalTags, ['영우']);
    await page.getByRole('button', { name: '다시 수정', exact: true }).click();
    assert.equal(await input.inputValue(), '#영우', 'reopening must use refreshed canonical tags');
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${engine} ${width}px: existing identity/re-edit/manual deletion/canonical save/reopen passed`);
  }
} finally { await browser.close(); }
