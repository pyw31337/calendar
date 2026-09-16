import './reference-memo.css';
import './reference-places.css';
import './reference-settlement.css';
import './reference-chat.css';
import './screens.css';
import { calculateSettlementRows } from '../../core/settlement-calculator.js';
import { authorFor } from './view-data.js';

const h = (...args) => window.React.createElement(...args);
const paths = {
  back: 'm15 18-6-6 6-6', search: 'm21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  menu: 'M4 6h16M4 12h16M4 18h16', plus: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M6 18 18 6', share: 'M12 16V3m-4 4 4-4 4 4M4 13v7h16v-7',
  pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  map: 'm3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6m6-3v15m6-12v15',
  edit: 'm15 4 5 5M4 20l4-1L20 7l-4-4L4 15v5',
};
export function DesignIcon({ name, size = 18 }) {
  return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: paths[name] || paths.menu }));
}
function IconButton({ label, icon, onClick }) {
  return h('button', { type: 'button', className: 'bp-icon-btn', 'aria-label': label, onClick }, h(DesignIcon, { name: icon }));
}
function Header({ title, count, onBack, onShare, onMenu, children, extra }) {
  return h('header', { className: 'bp-header v2-page-header' },
    h('div', { className: 'bp-header-row' },
      h('button', { className: 'bp-back-btn', type: 'button', 'aria-label': '뒤로가기', onClick: onBack }, h(DesignIcon, { name: 'back', size: 20 })),
      h('span', { className: 'bp-header-title' }, title),
      count && h('span', { className: 'bp-header-count' }, count),
      h('div', { className: 'bp-header-actions' }, extra,
        onShare && h(IconButton, { label: `${title} 공유`, icon: 'share', onClick: onShare }),
        h(IconButton, { label: `${title} 메뉴`, icon: 'menu', onClick: onMenu })
      )
    ), children
  );
}
function Search({ value, onChange, placeholder }) {
  return h('div', { className: 'bp-search-row' }, h(DesignIcon, { name: 'search', size: 16 }),
    h('input', { type: 'search', className: 'bp-search-input', placeholder, 'aria-label': placeholder, value, onChange: event => onChange(event.target.value) })
  );
}
function Fab({ label, onClick }) {
  return h('button', { type: 'button', className: 'bp-fab', 'aria-label': label, onClick }, h(DesignIcon, { name: 'plus', size: 22 }));
}
function Empty({ children }) { return h('p', { className: 'v2-empty' }, children); }
function overlays(slots, except = []) {
  return Object.entries(slots).filter(([key]) => !except.includes(key)).map(([key, value]) => h(window.React.Fragment, { key }, value));
}

export function MemoScreen(p) {
  const tags = [...new Set((p.allMemos || []).flatMap(memo => memo.tags || []))];
  return h('section', { className: 'v2-memo v2-fullscreen' },
    h('div', { className: 'bp-app-shell' },
      h(Header, { title: '메모', onBack: p.onBack, onShare: p.onShare, onMenu: p.onMenu },
        h(Search, { value: p.searchQuery, onChange: p.onSearch, placeholder: '메모 제목, 내용, 해시태그 검색' })
      ),
      h('div', { className: 'bp-tag-filter-row', 'aria-label': '메모 태그 필터' }, ['', ...tags].map(tag => h('button', {
        key: tag, type: 'button', className: `bp-tag-chip${p.selectedTag === tag ? ' bp-is-selected' : ''}`, 'aria-pressed': p.selectedTag === tag, onClick: () => p.onSelectTag(tag),
      }, tag || '전체'))),
      p.slots.shared,
      h('div', { className: 'bp-memo-grid' }, p.memos.map(memo => h('div', { key: memo.id, className: 'v2-memo-card-wrap', style: { '--memo-author-color': authorFor(memo, p.calendar.participants).color } }, p.renderCard(memo)))),
      !p.memos.length && h(Empty, null, '검색 조건에 맞는 메모가 없습니다.'),
      p.hasMoreMemos && h('button', { type: 'button', className: 'v2-load-more', onClick: p.onLoadMoreMemos }, '메모 더 보기'),
      h(Fab, { label: '메모 작성', onClick: p.onCompose })
    ),
    p.isComposerExpanded && h('div', { className: 'v2-compose-backdrop' },
      h('section', { className: 'v2-compose-dialog', role: 'dialog', 'aria-modal': true, 'aria-label': '메모 작성' },
        h('div', { className: 'v2-dialog-heading' }, h('strong', null, '메모 작성'), h(IconButton, { label: '닫기', icon: 'close', onClick: p.onCloseComposer })), p.slots.composer
      )
    ), overlays(p.slots, ['composer', 'shared'])
  );
}

export function PlacesScreen(p) {
  const [mapOpen, setMapOpen] = window.React.useState(false);
  const select = place => { setMapOpen(true); p.onSelect(place); };
  return h('section', { className: 'v2-places v2-fullscreen' },
    h('div', { className: 'bp-app-shell' },
      h(Header, { title: '장소', count: `등록 ${p.places.length}곳`, onBack: p.onBack, onShare: p.onShare, onMenu: p.onMenu,
        extra: h(IconButton, { label: mapOpen ? '지도 닫기' : '지도 보기', icon: 'map', onClick: () => setMapOpen(value => !value) }) },
      h(Search, { value: p.searchQuery, onChange: p.onSearch, placeholder: '장소 이름, 주소, 메모 검색' })),
      h('div', { className: 'bp-cat-filter-row', 'aria-label': '장소 분류' }, [{ id: 'all', name: '전체', color: '#7c3aed' }, ...p.categories].map(category => h('button', {
        type: 'button', key: category.id, className: `bp-cat-chip${p.categoryFilter === category.id ? ' bp-is-selected' : ''}`,
        'aria-pressed': p.categoryFilter === category.id, onClick: () => p.onCategory(category.id), style: { color: category.color, backgroundColor: `${category.color || '#7c3aed'}12` },
      }, category.name))),
      h('div', { className: 'v2-visit-filters' }, [['all', '전체'], ['visited', '방문'], ['planned', '예정']].map(([id, label]) => h('button', { key: id, type: 'button', 'aria-pressed': p.visitFilter === id, onClick: () => p.onVisitFilter(id) }, label))),
      mapOpen && h('div', { className: 'v2-map-panel' }, p.slots.map),
      p.isBulkShareMode ? h('div', { className: 'v2-bulk-places' }, p.slots.toolbar, p.slots.list) : h('div', { className: 'bp-place-grid' }, p.places.map(place => {
        const category = p.categories.find(c => c.id === place.categoryId);
        const visits = p.visitEntries(place);
        const planned = p.isPlanned(place);
        return h('article', { key: place.id, className: 'bp-place-card', 'data-place-id': place.id },
          h('button', { type: 'button', className: 'bp-place-map-thumb', 'aria-label': `${place.alias || place.name} 지도 보기`, onClick: () => select(place) }, h(DesignIcon, { name: 'pin', size: 26 })),
          h('div', { className: 'bp-place-tags' }, h('span', { className: 'bp-place-tag', style: { color: category?.color || '#6b6580', background: `${category?.color || '#6b6580'}12` } }, category?.name || '기타'),
            h('span', { className: 'bp-place-tag', style: { background: planned ? '#f3eeff' : '#ecfdf5', color: planned ? '#7c3aed' : '#16a34a' } }, planned ? '방문예정' : '방문')),
          h('button', { type: 'button', className: 'v2-place-title-button', onClick: () => select(place) }, h('span', { className: 'bp-place-name' }, place.alias || place.name), h('span', { className: 'bp-place-addr' }, place.address)),
          h('p', { className: 'bp-place-note' }, visits[0]?.note || place.memo || ''),
          h('div', { className: 'bp-place-meta-row' }, h('span', { className: 'bp-place-visit-count' }, `방문 기록 ${visits.length}회`), h('span', { className: 'bp-place-last-visit' }, visits[0]?.date || ''), h(IconButton, { label: `${place.alias || place.name} 편집`, icon: 'edit', onClick: () => p.onEdit(place) }))
        );
      })),
      !p.places.length && h(Empty, null, '검색 조건에 맞는 장소가 없습니다.'),
      h(Fab, { label: '장소 등록', onClick: p.onCompose })
    ), overlays(p.slots, ['map', 'toolbar', 'list'])
  );
}

function settlementRows(card, calendar, fallbackExpense) {
  const names = card.participantRows?.length ? card.participantRows.map(row => row.participantId) : card.participants?.length ? card.participants : (calendar.participants || []).filter(p => !p.deletedAt).map(p => p.name);
  const personal = new Map();
  for (const item of card.personalExpenses || []) {
    const name = item.participantId || '참여자';
    const amount = item.signedAmount ? Number(item.amount) || 0 : -Math.abs(Number(item.amount) || 0);
    personal.set(name, (personal.get(name) || 0) + amount);
  }
  return calculateSettlementRows(Number(card.amount) || fallbackExpense, names, personal, card.depositorName);
}
const won = amount => `${Math.abs(Number(amount) || 0).toLocaleString('ko-KR')}원`;
export function SettlementScreen(p) {
  const moveMonth = delta => { const d = new Date(p.year, p.month + delta, 1); p.onMonth(d.getFullYear(), d.getMonth()); };
  return h('section', { className: 'v2-settlement v2-fullscreen' },
    h('div', { className: 'bp-app-shell' },
      h(Header, { title: '정산', onBack: p.onBack, onShare: p.onShare, onMenu: p.onMenu }),
      h('div', { className: 'bp-content' },
        h('div', { className: 'bp-month-nav' },
          h('button', { type: 'button', className: 'bp-month-nav-btn', 'aria-label': '이전달', onClick: () => moveMonth(-1) }, h(DesignIcon, { name: 'back', size: 16 })),
          h('span', { className: 'bp-month-label' }, `${p.year}년 ${p.month + 1}월`),
          h('button', { type: 'button', className: 'bp-month-nav-btn', 'aria-label': '다음달', onClick: () => moveMonth(1), style: { transform: 'rotate(180deg)' } }, h(DesignIcon, { name: 'back', size: 16 })),
          h('button', { type: 'button', className: 'v2-period-toggle', 'aria-pressed': p.activeTab === 'total', onClick: () => p.onTab(p.activeTab === 'total' ? 'daily' : 'total') }, p.activeTab === 'total' ? '누적보기' : '월별보기')
        ),
        h('div', { className: 'v2-settlement-summary' },
          p.cards.map(card => h('article', { className: 'bp-settlement-card', key: card.id },
            h('div', { className: 'bp-settlement-card-header' }, h('strong', { className: 'bp-settlement-card-title' }, card.title || '정산'), h('button', { type: 'button', className: 'bp-settlement-card-badge', 'aria-label': `${card.title || '정산'} 수정`, onClick: () => p.onEdit(card) }, card.status === 'closed' ? '마감됨' : '진행중')),
            h('div', { className: 'bp-settlement-total-row' }, '총 지출 ', h('b', null, won(Number(card.amount) || p.allTimeExpense))),
            settlementRows(card, p.calendar, p.allTimeExpense).map(row => h('div', { className: 'bp-settlement-card-row', key: row.name },
              h('div', { className: 'bp-name-wrap' }, h('span', { className: 'bp-dot', style: { background: p.calendar.participants?.find(person => person.name === row.name)?.color || '#a78bfa' } }), h('span', { className: 'bp-name' }, row.name)),
              h('span', { className: `bp-amt ${row.amount < 0 ? 'bp-is-refund' : 'bp-is-owe'}` }, `${row.amount < 0 ? '+' : row.amount > 0 ? '-' : ''}${won(row.amount)}`)
            )),
            h('button', { type: 'button', className: 'bp-settlement-share-btn', onClick: p.onShare }, '정산 공유하기')
          )),
          h('article', { className: 'bp-settlement-card' }, h('strong', { className: 'bp-settlement-card-title' }, p.activeTab === 'total' ? '공금 누적 현황' : '이번 달 공금'),
            [['수입', p.displayIncome], ['지출', p.displayExpense], ['잔액', p.displayBalance]].map(([label, amount]) => h('div', { className: 'bp-settlement-card-row', key: label }, h('span', { className: 'bp-name' }, label), h('span', { className: 'bp-amt' }, `${amount < 0 ? '-' : ''}${won(amount)}`)))
          ),
          h('button', { type: 'button', className: 'v2-load-more', onClick: p.onList }, '마감된 정산 포함 전체 목록')
        ),
        h('div', { className: 'v2-expenses' },
          !p.rows.length && h(Empty, null, '이 기간에 등록된 지출 내역이 없습니다.'),
          p.rows.map(row => h('section', { key: row.meeting.date },
            h('h3', { className: 'bp-expense-section-label' }, row.meeting.date, row.meeting.note ? ` · ${row.meeting.note}` : ''),
            row.items.map((item, i) => h('button', { type: 'button', className: 'bp-expense-row', key: item.id || i, onClick: () => p.onSelectDate(row.meeting.date) },
              h('span', { className: 'bp-cat-dot', style: { background: item.category?.color || '#83798f' } }),
              h('span', { className: 'bp-expense-row-label' }, item.label, h('small', { className: 'bp-expense-row-payer' }, item.payerId ? `${p.calendar.participants?.find(person => person.id === item.payerId)?.name || item.payerId} 결제` : item.isSelfPay ? '자비부담' : item.isIncome ? '공금수입' : '공금지출', item.payerId && item.isSelfPay ? ' · 자비부담' : '')),
              h('span', { className: `bp-expense-row-amount ${item.isIncome ? 'bp-is-income' : 'bp-is-expense'}` }, `${item.isIncome ? '+' : '-'}${won(item.amount)}`)
            ))
          ))
        )
      ), h(Fab, { label: '정산 생성', onClick: p.onCompose })
    ), overlays(p.slots)
  );
}

export const renderMemoScreen = props => h(MemoScreen, props);
export const renderPlacesScreen = props => h(PlacesScreen, props);
export const renderSettlementScreen = props => h(SettlementScreen, props);

export function ChatScreen(p) {
  const React = window.React;
  const [toolsOpen, setToolsOpen] = React.useState(false);
  const clone = React.cloneElement;
  const originalRoot = p.legacyView.props.children[0];
  const slots = p.slots;
  const composer = clone(slots.composer, {
    className: 'chat-composer v2-chat-composer',
    style: { ...slots.composer.props.style, transform: 'none', opacity: 1, pointerEvents: 'auto' },
  },
    slots.reply, slots.photos, slots.files, slots.fileInput,
    h('div', { className: 'v2-chat-compose-row' },
      slots.attach,
      clone(slots.textarea, { className: 'bp-composer-input', style: { ...slots.textarea.props.style, minHeight: '38px', height: '38px', padding: '9px 14px', borderRadius: '9999px', resize: 'none' } }),
      clone(slots.send, { 'aria-label': '메시지 전송' }, h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true }, h('path', { d: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13' })))
    ),
    h('div', { className: 'v2-chat-compose-tools' }, slots.participant,
      h('button', { type: 'button', className: 'v2-tools-toggle', 'aria-expanded': toolsOpen, onClick: () => setToolsOpen(value => !value) }, toolsOpen ? '입력 도구 접기' : '이모티콘 · 밈 · 붙여넣기'),
      toolsOpen && slots.emoji, toolsOpen && slots.paste
    ),
    toolsOpen && slots.memes, toolsOpen && slots.resize
  );
  return h('section', { className: `v2-chat${p.isSearchOpen ? ' v2-chat-search-open' : ''}` },
    clone(originalRoot, { className: 'chat-room-container v2-chat-root' },
      h(Header, { title: '채팅', count: `${String(p.calendar?.title || '').replace(/^[^\p{L}\p{N}]+/u, '').trim()} · ${(p.calendar?.participants || []).filter(person => !person.deletedAt).length}명`, onBack: p.onBack, onMenu: p.onMenu,
        extra: h(IconButton, { label: '대화 검색', icon: 'search', onClick: p.onSearch }) }),
      slots.notice,
      clone(slots.body, { className: 'v2-chat-scroll' }),
      composer, slots.lightbox
    ), overlays(slots, ['notice', 'body', 'composer', 'lightbox', 'resize', 'memes', 'reply', 'textarea', 'photos', 'files', 'fileInput', 'participant', 'emoji', 'attach', 'paste', 'send'])
  );
}
export const renderChatScreen = props => h(ChatScreen, props);
