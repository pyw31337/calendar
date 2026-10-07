// Isolated real-component check. Every remote request is mocked or blocked; no production data.
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';

const base = process.env.AI_SMOKE_URL || 'http://127.0.0.1:5186';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local Vite server required');
const engine = process.env.CALENDAR_SMOKE_BROWSER || 'chromium';
const browser = await ({ chromium, firefox, webkit }[engine]).launch();
const fields = value => Object.fromEntries(Object.entries(value).map(([key, child]) => [key,
  typeof child === 'number' ? { integerValue: String(child) } : { stringValue: String(child) }]));
const html = `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/ui/v2/design.css">
<style>body{margin:0;font-family:Arial,sans-serif;padding:12px;box-sizing:border-box}*{box-sizing:border-box}</style>
<body class="v2-design"><main id="fixture"></main><script type="module">
import React from '/react-globals.js';
import { AiOperationsSummary } from '/ui/ai-operations-panel.js';
window.__gatherFirebaseConfig = { projectId: 'demo-ai' };
window.actions = [];
const root = window.ReactDOM.createRoot(document.getElementById('fixture'));
window.renderCalendar = calendar => root.render(React.createElement(AiOperationsSummary, { calendar,
  onOpenDate: (...args) => window.actions.push(args), onOpenGalleryAnalysis: () => window.actions.push(['gallery']) }));
window.renderCalendar({ id: 'empty', places: [] });
</script>`;
try {
  for (const width of [1280, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: 'Asia/Seoul' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => { errors.push(error.message); console.error('Fixture page error:', error.message); });
    page.on('console', message => { if (message.type() === 'error') console.error('Fixture console:', message.text()); });
    page.on('requestfailed', request => console.error('Fixture request failed:', new URL(request.url()).pathname, request.failure()?.errorText));
    let fail = true;
    let slowRelease;
    const delayed = new Promise(resolve => { slowRelease = resolve; });
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === base) {
        if (url.pathname === '/__ai_fixture') return route.fulfill({ contentType: 'text/html', body: html });
        return route.continue();
      }
      if (url.hostname !== 'firestore.googleapis.com') return route.abort();
      if (fail) return route.fulfill({ status: 503, body: '{}' });
      if (url.pathname.includes('cal_slow:runQuery')) {
        await delayed;
        return route.fulfill({ json: [{ document: { name: 'cal_slow/mediaAnalysis/old', fields: fields({ assetKey: 'old', status: 'failed' }) } }] });
      }
      if (url.pathname.includes('cal_failure:runQuery')) {
        return route.fulfill({ json: [{ document: { name: 'cal_failure/mediaAnalysis/fail', fields: fields({ assetKey: 'x', status: 'failed' }) } }] });
      }
      return route.fulfill({ json: url.pathname.endsWith(':runQuery') ? [] : { documents: [] } });
    });
    await page.goto(base + '/__ai_fixture');
    await page.getByRole('heading', { name: '지금 처리하면 좋은 일' }).waitFor();
    assert.match(await page.locator('.bp-ai-operations-count').innerText(), /확인 중/);
    await page.getByText('사진 분석 일부를 확인하지 못했습니다. 다시 확인해 주세요.', { exact: false }).waitFor();
    assert.equal(await page.locator('.bp-ai-operations-count').innerText(), '일부 미확인');
    fail = false;
    await page.getByRole('button', { name: '다시 확인', exact: true }).click();
    await page.getByText('최근 사진 분석 0건 중', { exact: false }).waitFor();
    assert.equal(await page.locator('.bp-ai-operations-count').innerText(), '점검 범위 내 없음');
    await page.evaluate(() => {
      const d = new Date();
      const key = days => { const copy = new Date(d); copy.setDate(copy.getDate() + days); return [copy.getFullYear(), String(copy.getMonth() + 1).padStart(2, '0'), String(copy.getDate()).padStart(2, '0')].join('-'); };
      window.renderCalendar({ id: 'action', places: [], participants: [{ id: 'p', name: '영우' }], confirmedMeeting: [
        ...[1, 2, 3, 4].map(i => ({ date: key(i), confirmed: true, note: '긴 일정 이름을 충분히 표시하여 잘리는 부분이 없는지 확인하는 일정' + i })),
        { date: key(-1), confirmed: false, expenses: [{ id: 'e', amount: 100, label: '공동 지출' }] }
      ] });
    });
    await page.getByRole('button', { name: /^전체 \d+건 보기$/ }).waitFor();
    assert.equal(await page.locator('.bp-ai-operations-row').count(), 3);
    await page.getByRole('button', { name: /^전체 \d+건 보기$/ }).click();
    assert.ok(await page.locator('.bp-ai-operations-row').count() > 3);
    const place = page.locator('.bp-ai-operations-row').filter({ hasText: '장소' }).first();
    await place.getByRole('button', { name: '열기', exact: true }).click();
    assert.ok(await page.evaluate(() => window.actions[0][0].match(/^\d{4}-\d{2}-\d{2}$/)));
    assert.ok(['meeting', 'participant'].includes(await page.evaluate(() => window.actions[0][1])));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'horizontal overflow');
    const evidence = await page.locator('.bp-ai-operations-copy small').first().boundingBox();
    assert.ok(evidence.width > 0 && evidence.x + evidence.width <= width);
    await page.evaluate(() => window.renderCalendar({ id: 'failure', places: [] }));
    await page.getByRole('button', { name: '사진 검토', exact: true }).first().click();
    assert.deepEqual(await page.evaluate(() => window.actions.at(-1)), ['gallery']);
    await page.evaluate(() => window.renderCalendar({ id: 'slow', places: [] }));
    // Wait for the delayed request to begin, then navigate before its response.
    await page.waitForRequest(request => request.url().includes('cal_slow:runQuery'));
    await page.evaluate(() => window.renderCalendar({ id: 'clean', places: [] }));
    slowRelease();
    await page.getByText('최근 사진 분석 0건 중', { exact: false }).waitFor();
    assert.equal(await page.getByRole('button', { name: '사진 검토', exact: true }).count(), 0, 'old calendar result leaked');
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${engine} ${width}px: pending/error/retry/actions/expansion/evidence/isolation passed`);
  }
} finally { await browser.close(); }
