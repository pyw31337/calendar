/**
 * Dedicated V2 shell IA (BentoPinkFinal side-nav + first-class destinations).
 * Used only by ui-app-shell-v2 / v2 screens — default shell never imports this.
 */

/** Primary destinations matching Full mocks + home. */
export const V2_PRIMARY = [
  { id: 'calendar', label: '캘린더', icon: 'calendar' },
  { id: 'chat', label: '채팅', icon: 'chat', isPill: true },
  { id: 'settlement', label: '정산', icon: 'settlement' },
  { id: 'gallery', label: '갤러리', icon: 'gallery', recordsSub: 'media' },
  { id: 'places', label: '장소', icon: 'places' },
  { id: 'memo', label: '메모', icon: 'memo' },
];

/** Secondary drawer items (still under records when needed). */
export const V2_SECONDARY = [
  { id: 'content', label: '컨텐츠', icon: 'content', recordsSub: 'content' },
  { id: 'archive', label: '보관함', icon: 'archive', recordsSub: 'archive' },
];

/** Tab ids that own a full destination page (not nested under records). */
export const V2_DESTINATION_TABS = ['calendar', 'chat', 'memo', 'places', 'settlement', 'records', 'more'];

/** Maps legacy view ids / side-nav ids → shell tab (+ optional records sub). */
export function resolveV2Destination(id) {
  if (!id) return { tab: 'calendar', sub: null };
  if (id === 'gallery' || id === 'media') return { tab: 'records', sub: 'media' };
  if (id === 'history' || id === 'archive') return { tab: 'records', sub: 'archive' };
  if (id === 'content') return { tab: 'records', sub: 'content' };
  if (id === 'memo' || id === 'places' || id === 'chat' || id === 'settlement' || id === 'calendar' || id === 'more') {
    return { tab: id, sub: null };
  }
  if (id === 'records') return { tab: 'records', sub: 'all' };
  return { tab: 'calendar', sub: null };
}

/**
 * Walk a React element tree and collect the first node whose className contains each key.
 * Keys are substrings matched against props.className (space-separated tokens preferred).
 */
export function extractSlotsByClass(root, keyToClass) {
  const found = {};
  const pending = new Set(Object.keys(keyToClass));
  const React = window.React;
  if (!root || !React || !pending.size) return found;

  const visit = (node) => {
    if (!node || !pending.size) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!React.isValidElement(node)) return;
    const cls = String(node.props?.className || '');
    for (const key of [...pending]) {
      const needle = keyToClass[key];
      if (cls.split(/\s+/).includes(needle) || cls.includes(needle)) {
        found[key] = node;
        pending.delete(key);
      }
    }
    visit(node.props?.children);
  };
  visit(root);
  return found;
}

/** Chat: body scroll + composer (+ optional named composer children). */
export function extractChatSlots(legacyTree) {
  const React = window.React;
  const top = extractSlotsByClass(legacyTree, {
    composer: 'chat-composer',
    body: 'chat-messages-scroll',
    notice: 'chat-notice-panel',
  });
  if (top.composer && React.isValidElement(top.composer)) {
    const inner = extractSlotsByClass(top.composer, {
      resize: 'chat-composer-resize-handle',
      memes: 'chat-composer-meme-area',
      photos: 'chat-composer-photos',
      files: 'chat-composer-files',
    });
    if (!inner.resize) {
      Object.assign(inner, extractSlotsByClass(top.composer, { resize: 'panel-resize-handle' }));
    }
    Object.assign(top, inner);
    const walk = (node, bag) => {
      if (!node || bag._done) return;
      if (Array.isArray(node)) { node.forEach(n => walk(n, bag)); return; }
      if (!React.isValidElement(node)) return;
      const type = node.type;
      const props = node.props || {};
      const cls = String(props.className || '');
      // Shared ParticipantPickerButton (ui-widgets) — required before compose when no login.
      // Component elements carry props.participant/onClick; className is applied inside render.
      const typeName = typeof type === 'function'
        ? String(type.displayName || type.name || '')
        : (type && type.$$typeof ? String(type.displayName || '') : '');
      // PanelResizeHandle is a component element, so its rendered
      // `chat-composer-resize-handle` class is not present on this source
      // node. Capture the live element by its component/label and move it
      // above the V2 textarea without replacing its pointer/key handlers.
      if (!bag.resize && (
        cls.includes('chat-composer-resize-handle')
        || /PanelResizeHandle/i.test(typeName)
        || /입력창 높이 조절/.test(String(props.label || props['aria-label'] || ''))
      )) {
        bag.resize = node;
      }
      if (!bag.participant && (
        cls.split(/\s+/).includes('participant-picker-button')
        || cls.includes('participant-picker')
        || /ParticipantPickerButton/i.test(typeName)
        || (Object.prototype.hasOwnProperty.call(props, 'participant') && typeof props.onClick === 'function' && 'placeholder' in props)
      )) {
        bag.participant = node;
      }
      // The "OO님에게 답장" preview card (ui-chat-room.js) carries no className -- it's
      // styled entirely via an inline --reply-accent custom property -- so it's invisible
      // to the className-based extraction above and gets silently dropped when composer's
      // children are replaced by the V2 layout unless captured here.
      if (!bag.reply && props.style && Object.prototype.hasOwnProperty.call(props.style, '--reply-accent')) {
        bag.reply = node;
      }
      if (type === 'textarea' && !bag.textarea) bag.textarea = node;
      if (type === 'button') {
        const label = String(props['aria-label'] || props.title || '');
        const childText = typeof props.children === 'string' ? props.children
          : Array.isArray(props.children)
            ? props.children.filter(c => typeof c === 'string').join('')
            : '';
        const hay = `${label} ${childText}`;
        if (!bag.attach && /파일 업로드|사진 또는 파일|사진 첨부|파일 첨부|paperclip|attach/i.test(hay) && !/제거|remove/i.test(hay)) {
          bag.attach = node;
        }
        if (!bag.send && /전송|보내|send/i.test(hay)) bag.send = node;
        if (!bag.paste && /붙여넣기|paste/i.test(hay)) bag.paste = node;
        if (!bag.emoji && /이모티콘|emoji/i.test(hay)) bag.emoji = node;
      }
      if (type === 'input' && props.type === 'file' && !bag.fileInput) bag.fileInput = node;
      walk(props.children, bag);
    };
    const bag = {};
    walk(top.composer, bag);
    Object.assign(top, bag);
  }
  return top;
}

export function extractMemoSlots(legacyTree) {
  return extractSlotsByClass(legacyTree, {
    body: 'memo-view-body',
    composer: 'memo-composer-card',
    list: 'memo-list-grid',
    menu: 'admin-side-menu-overlay',
  });
}

export function extractPlacesSlots(legacyTree) {
  return extractSlotsByClass(legacyTree, {
    map: 'places-map-sticky-area',
    toolbar: 'places-list-toolbar',
    list: 'places-list-body',
    filters: 'places-category-sticky-tabs',
    menu: 'admin-side-menu-overlay',
  });
}

export function extractSettlementSlots(legacyTree) {
  return extractSlotsByClass(legacyTree, {
    body: 'settlement-page-body',
    tabs: 'settlement-page-tabs',
    menu: 'admin-side-menu-overlay',
  });
}
