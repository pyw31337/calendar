const LOCAL_BASE_URL = process.env.LOCAL_BASE_URL || 'http://127.0.0.1:4173/index.html';
const CALENDAR_IDS = ['kkot', 'cw'];
const STORAGE_KEY = 'gather_calendars_permanent_v21';
const META_KEY = 'gather_calendars_meta_v5';
const ACTIVE_KEY = 'gather_active_calendar_id';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
}

async function getBrowserWebSocketUrl() {
  const version = await fetchJson('http://127.0.0.1:9222/json/version');
  if (!version.webSocketDebuggerUrl) {
    throw new Error('Chrome remote debugging endpoint is missing webSocketDebuggerUrl');
  }
  return version.webSocketDebuggerUrl;
}

class CdpBrowser {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id) {
        const pending = this.pending.get(msg.id);
        if (!pending) return;
        this.pending.delete(msg.id);
        if (msg.error) {
          pending.reject(new Error(msg.error.message || 'CDP error'));
        } else {
          pending.resolve(msg.result);
        }
        return;
      }
      if (!msg.method) return;
      const key = `${msg.sessionId || ''}:${msg.method}`;
      const queue = this.events.get(key);
      if (queue && queue.length > 0) {
        queue.shift()(msg.params || {});
      }
    };
  }

  close() {
    try {
      this.ws.close();
    } catch (e) {}
  }

  send(method, params = {}, sessionId = undefined) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      this.ws.send(JSON.stringify(payload));
    });
  }

  once(method, sessionId = undefined) {
    return new Promise((resolve) => {
      const key = `${sessionId || ''}:${method}`;
      const queue = this.events.get(key) || [];
      queue.push(resolve);
      this.events.set(key, queue);
    });
  }
}

async function createPage(browser, url) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.send('Target.attachToTarget', {
    targetId,
    flatten: true
  });
  await browser.send('Page.enable', {}, sessionId);
  await browser.send('Runtime.enable', {}, sessionId);
  await browser.send('Page.navigate', { url }, sessionId);
  await waitForPageReady(browser, sessionId);
  return { targetId, sessionId };
}

async function waitForPageReady(browser, sessionId) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const result = await browser.send(
        'Runtime.evaluate',
        {
          expression: 'document.readyState',
          returnByValue: true
        },
        sessionId
      );
      if (result?.result?.value === 'complete' || result?.result?.value === 'interactive') {
        return;
      }
    } catch (e) {}
    await sleep(150);
  }
  throw new Error('Page did not become ready in time');
}

async function waitForPageCondition(browser, sessionId, expression, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const value = await evalInPage(browser, sessionId, `(() => !!(${expression}))()`);
      if (value) return true;
    } catch (e) {}
    await sleep(120);
  }
  throw new Error(`Condition not met in time: ${expression}`);
}

async function waitForCalendarCache(browser, sessionId, calendarId) {
  await waitForPageCondition(
    browser,
    sessionId,
    `(() => {
      const calendars = JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '[]');
      return calendars.some((calendar) => calendar && calendar.id === ${JSON.stringify(calendarId)});
    })()`,
    20000
  );
}

async function evalInPage(browser, sessionId, expression) {
  const result = await browser.send(
    'Runtime.evaluate',
    {
      expression,
      awaitPromise: true,
      returnByValue: true
    },
    sessionId
  );
  if (result.exceptionDetails) {
    throw new Error(`Runtime evaluation failed: ${expression.slice(0, 120)}`);
  }
  return result.result.value;
}

async function setInputValue(browser, sessionId, selector, value) {
  const expr = `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error('Input not found: ${selector}');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`;
  await evalInPage(browser, sessionId, expr);
}

async function setInputValueByIndex(browser, sessionId, index, value, scopeSelector = '.modal-container') {
  const expr = `(() => {
    const root = document.querySelector(${JSON.stringify(scopeSelector)});
    if (!root) throw new Error('Root not found: ${scopeSelector}');
    const el = [...root.querySelectorAll('input[type="text"]')][${index}];
    if (!el) throw new Error('Text input not found at index ${index}');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`;
  await evalInPage(browser, sessionId, expr);
}

async function clickByText(browser, sessionId, text, rootSelector = 'document') {
  const expr = `(() => {
    const root = ${rootSelector === 'document' ? 'document' : `document.querySelector(${JSON.stringify(rootSelector)})`};
    if (!root) throw new Error('Root not found: ${rootSelector}');
    const buttons = [...root.querySelectorAll('button')];
    const button = buttons.find((b) => (b.textContent || '').trim().includes(${JSON.stringify(text)}));
    if (!button) throw new Error('Button not found: ${text}');
    button.click();
    return true;
  })()`;
  await evalInPage(browser, sessionId, expr);
}

async function clickButtonExactText(browser, sessionId, text, rootSelector = 'document') {
  const expr = `(() => {
    const root = ${rootSelector === 'document' ? 'document' : `document.querySelector(${JSON.stringify(rootSelector)})`};
    if (!root) throw new Error('Root not found: ${rootSelector}');
    const buttons = [...root.querySelectorAll('button')];
    const button = buttons.find((b) => (b.textContent || '').trim() === ${JSON.stringify(text)});
    if (!button) throw new Error('Button not found exactly: ${text}');
    button.click();
    return true;
  })()`;
  await evalInPage(browser, sessionId, expr);
}

async function clickButtonByTitle(browser, sessionId, title, rootSelector = 'document') {
  const expr = `(() => {
    const root = ${rootSelector === 'document' ? 'document' : `document.querySelector(${JSON.stringify(rootSelector)})`};
    if (!root) throw new Error('Root not found: ${rootSelector}');
    const buttons = [...root.querySelectorAll('button')];
    const button = buttons.find((b) => (b.getAttribute('title') || '').trim() === ${JSON.stringify(title)});
    if (!button) throw new Error('Button not found by title: ${title}');
    button.click();
    return true;
  })()`;
  await evalInPage(browser, sessionId, expr);
}

async function waitForToast(browser, sessionId, text) {
  const deadline = Date.now() + 35000;
  while (Date.now() < deadline) {
    const found = await evalInPage(
      browser,
      sessionId,
      `(() => !![...document.querySelectorAll('.toast')].find((el) => (el.textContent || '').includes(${JSON.stringify(text)})))()`
    );
    if (found) return true;
    await sleep(120);
  }
  throw new Error(`Toast not found: ${text}`);
}

async function openSettings(browser, sessionId) {
  await waitForPageCondition(browser, sessionId, 'document.querySelector(".header-actions")');
  await clickButtonByTitle(browser, sessionId, '설정', '.header-actions');
  await sleep(250);
  const open = await evalInPage(browser, sessionId, '(() => !!document.querySelector(".modal-container"))()');
  assert(open, 'Settings modal did not open');
}

async function openDateModal(browser, sessionId, dayNumber) {
  await waitForPageCondition(browser, sessionId, 'document.querySelectorAll(".day-cell").length > 0');
  await evalInPage(
    browser,
    sessionId,
    `(() => {
      const cells = [...document.querySelectorAll('.day-cell')];
      const target = cells.find((cell) => {
        if (cell.className.includes('other-month')) return false;
        const label = cell.querySelector('.day-number');
        return (label?.textContent || '').trim() === String(${dayNumber});
      });
      if (!target) throw new Error('Day cell not found: ${dayNumber}');
      target.click();
      return true;
    })()`
  );
  await sleep(250);
  const open = await evalInPage(browser, sessionId, '(() => !!document.querySelector(".modal-container"))()');
  assert(open, 'Date modal did not open');
}

async function acceptNextDialog(browser, sessionId, expectedMessage = '') {
  const dialogPromise = browser.once('Page.javascriptDialogOpening', sessionId);
  const dialog = await dialogPromise;
  if (expectedMessage) {
    assert(
      (dialog.message || '').includes(expectedMessage),
      `Unexpected dialog message: ${dialog.message || ''}`
    );
  }
  await browser.send('Page.handleJavaScriptDialog', { accept: true }, sessionId);
}

async function readLocalCalendars(browser, sessionId) {
  return evalInPage(
    browser,
    sessionId,
    `(() => JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '[]'))()`
  );
}

async function readLocalMeta(browser, sessionId) {
  return evalInPage(
    browser,
    sessionId,
    `(() => ({
      calendars: JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '[]'),
      meta: JSON.parse(localStorage.getItem(${JSON.stringify(META_KEY)}) || '{"lastModified":0}'),
      active: localStorage.getItem(${JSON.stringify(ACTIVE_KEY)}) || ''
    }))()`
  );
}

async function waitForLocalCalendar(browser, sessionId, calendarId, predicateSource, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const matched = await evalInPage(
      browser,
      sessionId,
      `(() => {
        const calendars = JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '[]');
        const calendar = calendars.find((item) => item && item.id === ${JSON.stringify(calendarId)});
        if (!calendar) return false;
        return (${predicateSource})(calendar);
      })()`
    );
    if (matched) return true;
    await sleep(100);
  }
  return false;
}

async function restoreLocalState(browser, sessionId, snapshot) {
  await evalInPage(
    browser,
    sessionId,
    `(() => {
      const snapshot = ${JSON.stringify(snapshot)};
      localStorage.clear();
      Object.entries(snapshot).forEach(([key, value]) => localStorage.setItem(key, value));
      return true;
    })()`
  );
}

async function captureSeedSnapshot(browser) {
  const targets = await browser.send('Target.getTargets');
  const localUrl = new URL(LOCAL_BASE_URL);
  const localPagePrefix = `${localUrl.origin}${localUrl.pathname}`;
  const target = (targets.targetInfos || []).find(
    (info) =>
      info.type === 'page' &&
      info.url.startsWith(localPagePrefix) &&
      /[?&]id=(kkot|cw)\b/.test(info.url)
  );
  if (!target) return null;

  const { sessionId } = await browser.send('Target.attachToTarget', {
    targetId: target.targetId,
    flatten: true
  });
  await browser.send('Runtime.enable', {}, sessionId);
  const snapshot = await evalInPage(
    browser,
    sessionId,
    `(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    })()`
  );
  return snapshot;
}

function getCalendarById(calendars, id) {
  return (calendars || []).find((calendar) => calendar && calendar.id === id);
}

function activeParticipants(calendar) {
  return (calendar?.participants || []).filter((participant) => !participant?.removedAt);
}

function activeAvailabilities(calendar) {
  return (calendar?.availabilities || []).filter((availability) => !availability?.deletedAt);
}

function normalizeColor(color) {
  return (color || '').trim().toLowerCase();
}

async function exerciseCalendar(browser, sessionId, otherSessionId, calendarId, snapshot) {
  const original = await readLocalCalendars(browser, sessionId);
  let current = getCalendarById(original, calendarId);
  const otherId = CALENDAR_IDS.find((id) => id !== calendarId);
  const otherCalendarBefore = getCalendarById(original, otherId);

  assert(current, `Missing calendar snapshot for ${calendarId}`);
  assert(otherCalendarBefore, `Missing other calendar snapshot for ${otherId}`);

  if (activeParticipants(current).length === 0) {
    await openSettings(browser, sessionId);
    await setInputValueByIndex(browser, sessionId, 2, `${calendarId}-base-participant`);
    await clickByText(browser, sessionId, '추가', '.modal-container');
    await sleep(150);
    await clickByText(browser, sessionId, '설정 저장', '.modal-container');
    await waitForToast(browser, sessionId, '캘린더 설정이 저장되었습니다. ✅');
    const seeded = await readLocalCalendars(browser, sessionId);
    current = getCalendarById(seeded, calendarId);
    assert(activeParticipants(current).length > 0, `Expected seeded participant for ${calendarId}`);
  }

  const originalTitle = current.title;
  const originalDescription = current.description || '';
  const originalParticipants = activeParticipants(current).map((participant) => ({
    id: participant.id,
    name: participant.name,
    color: participant.color
  }));

  const titleQa = `${originalTitle} QA`;
  const descriptionQa = `${originalDescription} QA`;
  const participantQaName = `${originalParticipants[0].name} QA`;
  const participantQaColor = originalParticipants[0].color === '#111111' ? '#222222' : '#111111';
  const tempParticipantName = `${calendarId}-temp-${Date.now().toString().slice(-6)}`;

  // Settings mutation test
  await openSettings(browser, sessionId);
  await setInputValueByIndex(browser, sessionId, 0, titleQa);
  const textInputs = await evalInPage(
    browser,
    sessionId,
    `(() => [...document.querySelectorAll('.modal-container input[type="text"]')].map((el) => el.value))()`
  );
  assert(textInputs.length >= 3, `Expected settings modal inputs for ${calendarId}`);
  await setInputValueByIndex(browser, sessionId, 1, descriptionQa);
  await setInputValueByIndex(browser, sessionId, 2, tempParticipantName);
  await clickByText(browser, sessionId, '추가', '.modal-container');
  await sleep(150);

  const afterAddCount = await evalInPage(
    browser,
    sessionId,
    `(() => document.querySelectorAll('.modal-container .btn-danger').length)()`
  );
  assert(afterAddCount >= originalParticipants.length + 1, `Expected temp participant to be added for ${calendarId}`);

  // Update first participant name/color, then remove temp participant and save
  const participantInputsBeforeSave = await evalInPage(
    browser,
    sessionId,
    `(() => [...document.querySelectorAll('.modal-container input[type="text"]')].map((el) => el.value))()`
  );
  assert(participantInputsBeforeSave.includes(tempParticipantName), `Temp participant missing for ${calendarId}`);

  await setInputValueByIndex(browser, sessionId, 3, participantQaName);
  await evalInPage(
    browser,
    sessionId,
    `(() => {
      const colorInputs = [...document.querySelectorAll('.modal-container input[type="color"]')];
      if (!colorInputs[0]) throw new Error('Missing color input');
      colorInputs[0].value = ${JSON.stringify(participantQaColor)};
      colorInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      colorInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`
  );

  await evalInPage(
    browser,
    sessionId,
    `(() => {
      const removeButtons = [...document.querySelectorAll('.modal-container button')].filter((btn) => (btn.textContent || '').trim() === '✕');
      if (removeButtons.length < 2) throw new Error('No removable participant button found');
      removeButtons[removeButtons.length - 1].click();
      return true;
    })()`
  );
  await sleep(150);

  await clickByText(browser, sessionId, '설정 저장', '.modal-container');
  await waitForToast(browser, sessionId, '캘린더 설정이 저장되었습니다. ✅');
  assert(
    await waitForLocalCalendar(
      browser,
      sessionId,
      calendarId,
      `(calendar) => calendar.title === ${JSON.stringify(titleQa)} && calendar.description === ${JSON.stringify(descriptionQa)}`
    ),
    `${calendarId} settings save did not settle`
  );

  const afterSettingsSave = await readLocalCalendars(browser, sessionId);
  const updated = getCalendarById(afterSettingsSave, calendarId);
  assert(updated.title === titleQa, `${calendarId} title not saved`);
  assert(updated.description === descriptionQa, `${calendarId} description not saved`);
  assert(activeParticipants(updated).some((p) => p.name === participantQaName), `${calendarId} participant update not saved`);
  assert(!activeParticipants(updated).some((p) => p.name === tempParticipantName), `${calendarId} temp participant leaked after save`);

  const otherAfterSettings = getCalendarById(afterSettingsSave, otherId);
  assert(otherAfterSettings.title === otherCalendarBefore.title, `${otherId} title changed while editing ${calendarId}`);
  assert(otherAfterSettings.description === (otherCalendarBefore.description || ''), `${otherId} description changed while editing ${calendarId}`);
  assert(
    activeParticipants(otherAfterSettings).map((p) => p.name).join('|') === activeParticipants(otherCalendarBefore).map((p) => p.name).join('|'),
    `${otherId} participants changed while editing ${calendarId}`
  );

  // Restore settings
  await openSettings(browser, sessionId);
  await setInputValueByIndex(browser, sessionId, 0, originalTitle);
  await setInputValueByIndex(browser, sessionId, 1, originalDescription);
  const firstParticipantInputs = await evalInPage(
    browser,
    sessionId,
    `(() => [...document.querySelectorAll('.modal-container input[type="text"]')].map((el) => el.value))()`
  );
  assert(firstParticipantInputs.length >= 4, 'Expected participant inputs when restoring settings');
  await setInputValueByIndex(browser, sessionId, 3, originalParticipants[0].name);
  await evalInPage(
    browser,
    sessionId,
    `(() => {
      const colorInputs = [...document.querySelectorAll('.modal-container input[type="color"]')];
      colorInputs[0].value = ${JSON.stringify(originalParticipants[0].color)};
      colorInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      colorInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`
  );
  await clickByText(browser, sessionId, '설정 저장', '.modal-container');
  await waitForToast(browser, sessionId, '캘린더 설정이 저장되었습니다. ✅');
  assert(
    await waitForLocalCalendar(
      browser,
      sessionId,
      calendarId,
      `(calendar) => calendar.title === ${JSON.stringify(originalTitle)} && (calendar.description || '') === ${JSON.stringify(originalDescription)}`
    ),
    `${calendarId} settings restore did not settle`
  );

  const restoredState = await readLocalCalendars(browser, sessionId);
  const restored = getCalendarById(restoredState, calendarId);
  assert(restored.title === originalTitle, `${calendarId} title was not restored`);
  assert((restored.description || '') === originalDescription, `${calendarId} description was not restored`);
  assert(activeParticipants(restored)[0].name === originalParticipants[0].name, `${calendarId} first participant name was not restored`);
  assert(normalizeColor(activeParticipants(restored)[0].color) === normalizeColor(originalParticipants[0].color), `${calendarId} first participant color was not restored`);

  // Availability create / edit / delete test
  const tempNote = `${calendarId}-note-${Date.now().toString().slice(-6)}`;
  const tempNoteEdited = `${tempNote}-edit`;
  const targetDay = 20;

  await openDateModal(browser, sessionId, targetDay);
  await setInputValue(browser, sessionId, '.modal-container input[type="text"]', tempNote);
  await clickButtonExactText(browser, sessionId, '등록/저장', '.modal-container');
  await waitForToast(browser, sessionId, '일정이 등록되었습니다.');
  assert(
    await waitForLocalCalendar(
      browser,
      sessionId,
      calendarId,
      `(calendar) => (calendar.availabilities || []).some((availability) => !availability.deletedAt && (availability.note || '') === ${JSON.stringify(tempNote)})`
    ),
    `${calendarId} note save did not settle`
  );

  let afterNoteSave = await readLocalCalendars(browser, sessionId);
  let afterNoteCal = getCalendarById(afterNoteSave, calendarId);
  assert(
    activeAvailabilities(afterNoteCal).some((availability) => (availability.note || '') === tempNote),
    `${calendarId} note was not saved`
  );
  let otherAfterNote = getCalendarById(afterNoteSave, otherId);
  assert(
    !activeAvailabilities(otherAfterNote).some((availability) => (availability.note || '') === tempNote),
    `${otherId} received ${calendarId} note`
  );

  await openDateModal(browser, sessionId, targetDay);
  await evalInPage(
    browser,
    sessionId,
    `(() => {
      const root = document.querySelector('.modal-container');
      if (!root) throw new Error('Modal not found');
      const badge = [...root.querySelectorAll('.participant-badge')]
        .find((el) => (el.textContent || '').includes(${JSON.stringify(originalParticipants[0].name)}));
      if (badge) badge.click();
      return true;
    })()`
  );
  await setInputValueByIndex(browser, sessionId, 0, tempNoteEdited);
  await clickButtonExactText(browser, sessionId, '등록/저장', '.modal-container');
  await waitForToast(browser, sessionId, '일정이 등록되었습니다.');
  assert(
    await waitForLocalCalendar(
      browser,
      sessionId,
      calendarId,
      `(calendar) => (calendar.availabilities || []).some((availability) => !availability.deletedAt && (availability.note || '') === ${JSON.stringify(tempNoteEdited)})`
    ),
    `${calendarId} note edit did not settle`
  );

  afterNoteSave = await readLocalCalendars(browser, sessionId);
  afterNoteCal = getCalendarById(afterNoteSave, calendarId);
  assert(
    activeAvailabilities(afterNoteCal).some((availability) => (availability.note || '') === tempNoteEdited),
    `${calendarId} note edit was not saved`
  );

  await openDateModal(browser, sessionId, targetDay);
  const confirmDeletePromise = acceptNextDialog(browser, sessionId, '참여자를 삭제하시겠습니까?');
  await clickButtonExactText(browser, sessionId, '삭제', '.modal-container');
  await confirmDeletePromise;
  await waitForToast(browser, sessionId, '삭제 되었습니다.');
  assert(
    await waitForLocalCalendar(
      browser,
      sessionId,
      calendarId,
      `(calendar) => !(calendar.availabilities || []).some((availability) => !availability.deletedAt && (availability.note || '') === ${JSON.stringify(tempNoteEdited)})`
    ),
    `${calendarId} note delete did not settle`
  );

  const tempNoteRecreated = `${tempNote}-recreate`;
  await openDateModal(browser, sessionId, targetDay);
  await setInputValue(browser, sessionId, '.modal-container input[type="text"]', tempNoteRecreated);
  await clickButtonExactText(browser, sessionId, '등록/저장', '.modal-container');
  await waitForToast(browser, sessionId, '일정이 등록되었습니다.');
  assert(
    await waitForLocalCalendar(
      browser,
      sessionId,
      calendarId,
      `(calendar) => (calendar.availabilities || []).some((availability) => !availability.deletedAt && (availability.note || '') === ${JSON.stringify(tempNoteRecreated)})`
    ),
    `${calendarId} recreated note save did not settle`
  );

  afterNoteSave = await readLocalCalendars(browser, sessionId);
  afterNoteCal = getCalendarById(afterNoteSave, calendarId);
  assert(
    activeAvailabilities(afterNoteCal).some((availability) => (availability.note || '') === tempNoteRecreated),
    `${calendarId} note was not recreated after delete`
  );
  const activityLogs = Array.isArray(afterNoteCal.activityLogs) ? afterNoteCal.activityLogs : [];
  assert(
    ['create', 'update', 'delete'].every((action) => activityLogs.some((log) => log.action === action && log.date.endsWith(`-${String(targetDay).padStart(2, '0')}`))),
    `${calendarId} activity logs did not record create/update/delete`
  );
  await waitForPageCondition(
    browser,
    sessionId,
    `(() => {
      const text = [...document.querySelectorAll('.recent-log-row')].map((row) => row.textContent || '').join(' ');
      return text.includes('[등록]') && text.includes('[수정]') && text.includes('[삭제]');
    })()`
  );

  const otherAfterDelete = getCalendarById(afterNoteSave, otherId);
  assert(
    !activeAvailabilities(otherAfterDelete).some((availability) => (availability.note || '') === tempNoteEdited),
    `${otherId} received deleted note from ${calendarId}`
  );

  return {
    calendarId,
    scenario: 'local browser mutation isolation',
    restoredTitle: restored.title,
    localScenarioParticipantCount: activeParticipants(restored).length
  };
}

async function main() {
  const browserWsUrl = await getBrowserWebSocketUrl();
  const browser = new CdpBrowser(browserWsUrl);
  await browser.connect();
  const seedSnapshot = await captureSeedSnapshot(browser);

  const pages = {};
  const snapshot = {};

  try {
    for (const id of CALENDAR_IDS) {
      pages[id] = await createPage(browser, `${LOCAL_BASE_URL}?id=${id}&storage=local`);
      await waitForPageReady(browser, pages[id].sessionId);
      try {
        await waitForCalendarCache(browser, pages[id].sessionId, id);
      } catch (err) {
        if (!seedSnapshot) throw err;
        await restoreLocalState(browser, pages[id].sessionId, seedSnapshot);
        await browser.send('Page.reload', { ignoreCache: true }, pages[id].sessionId);
        await waitForPageReady(browser, pages[id].sessionId);
        await waitForCalendarCache(browser, pages[id].sessionId, id);
      }
    }

    snapshot.localStorage = await evalInPage(
      browser,
      pages.kkot.sessionId,
      `(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        return JSON.stringify(data);
      })()`
    );

    const results = [];
    for (const id of CALENDAR_IDS) {
      const otherId = CALENDAR_IDS.find((candidate) => candidate !== id);
      results.push(
        await exerciseCalendar(
          browser,
          pages[id].sessionId,
          pages[otherId].sessionId,
          id,
          snapshot
        )
      );
    }

    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } finally {
    if (snapshot.localStorage) {
      for (const id of CALENDAR_IDS) {
        try {
          await evalInPage(
            browser,
            pages[id].sessionId,
            `(() => {
              const snapshot = JSON.parse(${JSON.stringify(snapshot.localStorage)});
              localStorage.clear();
              Object.entries(snapshot).forEach(([key, value]) => localStorage.setItem(key, value));
              return true;
            })()`
          );
          await browser.send('Page.reload', { ignoreCache: true }, pages[id].sessionId);
          await waitForPageReady(browser, pages[id].sessionId);
        } catch (e) {}
      }
    }

    for (const id of CALENDAR_IDS) {
      if (pages[id]?.targetId) {
        try {
          await browser.send('Target.closeTarget', { targetId: pages[id].targetId });
        } catch (e) {}
      }
    }
    browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
