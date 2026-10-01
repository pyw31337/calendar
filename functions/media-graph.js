'use strict';

// Non-destructive media graph helpers.  Legacy message/memo/meeting fields remain readable
// during migration; these helpers materialize the same facts into `assets` + `assetEdges`
// without deleting or rewriting any original image URL.

const crypto = require('crypto');

function text(value, max = 640) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function normalizeUrl(value) {
  const raw = text(value, 4096);
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    parsed.hash = '';
    if (parsed.hostname === 'firebasestorage.googleapis.com' || parsed.hostname.endsWith('.firebasestorage.app')) parsed.search = '';
    return parsed.toString();
  } catch (_) {
    return raw.split(/[?#]/)[0];
  }
}

function storagePath(value) {
  const match = String(value || '').match(/\/o\/([^?#]+)/);
  if (!match) return '';
  try { return decodeURIComponent(match[1]); } catch (_) { return ''; }
}

function tagTokens(value, max = 20) {
  const seen = new Set();
  return String(value || '').split(/[\s,#]+/).map(token => token.trim().replace(/^#+/, '').slice(0, 80))
    .filter(token => token && !seen.has(token) && (seen.add(token) || true)).slice(0, max);
}

function stableId(value, prefix = '') {
  return `${prefix}${crypto.createHash('sha256').update(String(value), 'utf8').digest('hex').slice(0, 40)}`;
}

function ownerParts(owner = {}) {
  const sourceOwner = text(owner.sourceOwner, 240);
  const match = sourceOwner.match(/^(message|memo|meeting):(.+?)(?::(\d+))?$/);
  if (!match) return { sourceOwner, sourceType: text(owner.source, 32) || 'unknown', sourceId: '', imageIndex: null };
  return {
    sourceOwner,
    sourceType: match[1],
    sourceId: match[2],
    imageIndex: match[3] == null ? null : Number(match[3])
  };
}

function sourceUrls(source = {}) {
  const urls = [
    ...(Array.isArray(source.imageUrls) ? source.imageUrls : []),
    ...(Array.isArray(source.thumbUrls) ? source.thumbUrls : []),
    source.imageUrl, source.thumbUrl
  ].map(normalizeUrl).filter(Boolean);
  if (Array.isArray(source.photos)) {
    source.photos.forEach(photo => {
      ['imageUrl', 'full', 'url', 'thumbUrl', 'thumb'].forEach(field => {
        const value = normalizeUrl(photo?.[field]);
        if (value) urls.push(value);
      });
    });
  }
  return new Set(urls);
}

function addCopy(copies, url, where, tags, sourceSnapshot) {
  const key = normalizeUrl(url);
  if (!key) return;
  const list = copies.get(key) || [];
  list.push({ where, tags: tagTokens(tags).sort().join(' '), sourceSnapshot });
  copies.set(key, list);
}

function assetProjection(row = {}, { calendarId = '' } = {}) {
  const assetId = text(row.assetKey || row.id, 180);
  const tags = tagTokens(row.tags);
  const full = text(row.full || row.imageUrl || row.thumb, 4096);
  const thumb = text(row.thumb || row.thumbUrl || full, 4096);
  return {
    assetId,
    kind: 'image',
    status: 'active',
    calendarId,
    storage: {
      originalUrl: full,
      thumbnailUrl: thumb,
      originalPath: storagePath(full),
      thumbnailPath: storagePath(thumb)
    },
    capturedAt: Math.max(0, Number(row.timestamp) || 0),
    uploadedAt: Math.max(0, Number(row.updatedAt || row.timestamp) || 0),
    uploadedBy: text(row.participantId, 120),
    tags: { people: [], places: [], dates: [], free: tags },
    legacy: { tagText: text(row.tags), photoIndexKey: assetId, source: text(row.source, 40) },
    commentCount: Math.max(0, Number(row.commentCount) || 0),
    refCount: Array.isArray(row.owners) ? row.owners.length : 0,
    migrationState: 'dual-write',
    updatedAt: Date.now()
  };
}

function assetEdges(row = {}) {
  const assetId = text(row.assetKey || row.id, 180);
  return (Array.isArray(row.owners) ? row.owners : []).map(owner => {
    const parts = ownerParts(owner);
    const sourceId = parts.sourceId || text(owner.messageId || owner.photoId || owner.meetingDate, 180);
    const id = stableId(`${assetId}|${parts.sourceOwner || `${parts.sourceType}:${sourceId}`}`, 'edge_');
    return {
      id,
      assetId,
      sourceType: parts.sourceType,
      sourceId,
      sourceOwner: parts.sourceOwner,
      imageIndex: parts.imageIndex,
      meetingId: text(owner.meetingId, 160),
      meetingDate: text(owner.meetingDate, 20),
      participantId: text(owner.participantId, 120),
      // GPS/place/AI relations are candidates only until a person confirms them.
      placeId: '',
      relationStatus: 'confirmed',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  });
}

function buildIntegrityReview({ calendarId = '', indexRows = [], messages = [], memos = [], meetings = [], comments = [], missingAssetKeys = new Set() } = {}) {
  const sourceMaps = {
    message: new Map(messages.map(row => [String(row.id || ''), sourceUrls(row)])),
    memo: new Map(memos.map(row => [String(row.id || ''), sourceUrls(row)])),
    meeting: new Map(meetings.map(row => [String(row.id || row.date || ''), sourceUrls(row)]))
  };
  const rowsByAsset = new Map(indexRows.map(row => [String(row.assetKey || row.id || ''), row]).filter(([key]) => key));
  const legacyToAsset = new Map();
  rowsByAsset.forEach((row, assetKey) => {
    [assetKey, ...(Array.isArray(row.legacyKeys) ? row.legacyKeys : [])].forEach(key => {
      if (key) legacyToAsset.set(String(key), assetKey);
    });
  });
  const findings = [];
  rowsByAsset.forEach((row, assetKey) => {
    if (missingAssetKeys.has(assetKey)) {
      findings.push({
        id: `missing_${stableId(assetKey)}`, kind: 'missing_asset', severity: 'warning', assetKey,
        status: 'review_required', actions: ['restore_from_backup', 'reupload', 'hide'],
        message: 'Storage 원본과 썸네일을 찾지 못했습니다. 자동 삭제하지 않았습니다.',
        snapshot: { full: text(row.full, 1024), thumb: text(row.thumb, 1024), owners: row.owners || [] }
      });
    }
    (Array.isArray(row.owners) ? row.owners : []).forEach(owner => {
      const parts = ownerParts(owner);
      const source = sourceMaps[parts.sourceType]?.get(parts.sourceId);
      const ownerUrls = [normalizeUrl(owner.full || row.full), normalizeUrl(owner.thumb || row.thumb)].filter(Boolean);
      if (!source || !ownerUrls.some(url => source.has(url))) {
        findings.push({
          id: `stale_${stableId(`${assetKey}|${parts.sourceOwner}`)}`, kind: 'stale_owner', severity: 'info', assetKey,
          status: 'review_required', actions: ['rebuild_projection', 'hide'],
          message: '사진 인덱스 owner가 현재 원본 문서와 일치하지 않습니다.',
          snapshot: { sourceOwner: parts.sourceOwner, full: text(owner.full || row.full, 1024), thumb: text(owner.thumb || row.thumb, 1024) }
        });
      }
    });
  });

  const copies = new Map();
  const addSourceCopies = (type, rows) => rows.forEach(row => {
    const urls = Array.isArray(row.imageUrls) && row.imageUrls.length ? row.imageUrls : (row.imageUrl ? [row.imageUrl] : []);
    urls.forEach((url, index) => addCopy(copies, url, `${type}:${row.id}:${index}`, row.imageTagMap?.[row.assetKey] || row.imageTags?.[index], { id: row.id, type }));
    (Array.isArray(row.photos) ? row.photos : []).forEach((photo, index) => addCopy(copies, photo?.imageUrl || photo?.full || photo?.url, `${type}:${row.id}:${index}`, photo?.tags, { id: row.id, type }));
  });
  addSourceCopies('message', messages);
  addSourceCopies('memo', memos);
  addSourceCopies('meeting', meetings);
  indexRows.forEach(row => addCopy(copies, row.full || row.thumb, `index:${row.assetKey || row.id}`, row.tags, { id: row.assetKey || row.id, type: 'index' }));
  copies.forEach((copyRows, url) => {
    const tagStates = new Set(copyRows.map(row => row.tags));
    if (copyRows.length > 1 && tagStates.size > 1) {
      const assetKey = rowsByAsset.get(url)?.assetKey || Array.from(rowsByAsset.values()).find(row => normalizeUrl(row.full || row.thumb) === url)?.assetKey || '';
      findings.push({
        id: `tags_${stableId(url)}`, kind: 'tag_divergence', severity: 'info', assetKey, status: 'review_required',
        actions: ['sync_from_asset', 'keep_source'], message: '같은 사진 사본의 태그가 서로 다릅니다.',
        snapshot: { copies: copyRows.slice(0, 12).map(row => ({ where: row.where, tags: row.tags })) }
      });
    }
  });
  (Array.isArray(comments) ? comments : []).forEach(thread => {
    const key = String(thread.id || '');
    const targetAssetKey = legacyToAsset.get(key) || '';
    const isCanonical = key.startsWith('asset:v1:');
    if (isCanonical && rowsByAsset.has(key)) return;
    findings.push({
      id: `comment_${stableId(key)}`, kind: targetAssetKey ? 'legacy_comment_migratable' : 'legacy_comment_unresolved',
      severity: targetAssetKey ? 'info' : 'warning', assetKey: targetAssetKey, status: 'review_required',
      actions: targetAssetKey ? ['migrate_comment', 'keep_legacy'] : ['manual_link', 'hide'],
      message: targetAssetKey ? '자산 키로 자동 이관할 수 있는 레거시 댓글입니다.' : '연결할 사진을 확인할 수 없는 레거시 댓글입니다.',
      snapshot: { legacyKey: key, commentCount: Array.isArray(thread.comments) ? thread.comments.length : 0 }
    });
  });
  return { calendarId, generatedAt: Date.now(), findings, assets: Array.from(rowsByAsset.values()).map(row => assetProjection(row, { calendarId })), edges: Array.from(rowsByAsset.values()).flatMap(assetEdges) };
}

module.exports = { buildIntegrityReview, assetProjection, assetEdges, stableId, normalizeUrl, storagePath, tagTokens };
