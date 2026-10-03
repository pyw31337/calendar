/**
 * 어드민 '맥 백업' 탭. The button stores a request (functions/index.js macBackupAdmin); the Mac
 * picks it up on its next 15-minute check (tools/mac-automation/mac-backup-sync.mjs), runs
 * backup.sh --auto and reports the summary back. Only times and the summary are shown -- the
 * backup itself stays in the Mac's iCloud Drive "Moyeora Backups" folder.
 */
const h = (...args) => window.React.createElement(...args);

async function callMacBackup(password, action) {
  const projectId = String(window.__gatherFirebaseConfig?.projectId || '').trim();
  const response = await fetch(`https://asia-northeast3-${encodeURIComponent(projectId)}.cloudfunctions.net/macBackupAdmin`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, action }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) throw new Error(`요청 실패 (${response.status})`);
  return payload.state || {};
}

const when = value => (Number(value) > 0 ? new Date(Number(value)).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-');
const megabytes = bytes => `${Math.round((Number(bytes) || 0) / 1048576 * 10) / 10}MB`;

export function MacBackupPanel({ password, cardStyle, titleStyle }) {
  const React = window.React;
  const [state, setState] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const load = React.useCallback(async action => {
    setBusy(true);
    setError('');
    try { setState(await callMacBackup(password, action)); } catch (err) { setError(String(err?.message || err)); } finally { setBusy(false); }
  }, [password]);
  React.useEffect(() => { void load('status'); }, [load]);

  const result = state?.lastResult || null;
  const pending = Number(state?.requestedAt || 0) > Number(state?.handledRequestAt || 0);
  const macAlive = Date.now() - Number(state?.lastSeenAt || 0) < 60 * 60 * 1000;
  const line = (label, value) => h('div', { style: { display: 'flex', gap: '8px', fontSize: 'var(--font-size-sm)' } },
    h('span', { style: { color: 'var(--text-sub)', minWidth: '96px' } }, label), h('span', { style: { color: 'var(--text-main)', fontWeight: 600 } }, value));

  return h('section', { style: cardStyle },
    h('h4', { style: titleStyle }, '맥 백업'),
    h('div', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: '10px' } },
      '맥미니의 자동 실행·사진 분석 데이터·비밀값(암호로 잠금)을 iCloud Drive "Moyeora Backups"에 백업해요. 버튼을 누르면 맥이 15분 안에 확인하고 백업합니다.'),
    error && h('div', { style: { color: '#B91C1C', fontSize: 'var(--font-size-sm)', marginBottom: '8px' } }, error),
    state && h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' } },
      line('맥 상태', state.lastSeenAt ? `${macAlive ? '켜져 있음' : '연락 없음'} (마지막 확인 ${when(state.lastSeenAt)})` : '아직 연결 기록 없음'),
      line('요청', pending ? `대기 중 (${when(state.requestedAt)} 요청)` : (state.requestedAt ? `처리됨 (${when(state.requestedAt)} 요청)` : '-')),
      result && line('마지막 백업', result.ok
        ? `${when(result.at)} · ${megabytes(result.sizeBytes)} · 자동 실행 ${result.agents}개 · 저장소 ${result.repos}개 · 비밀값 ${result.withSecrets ? '포함' : '제외'}`
        : `실패 ${when(result.at)} · ${result.error || ''}`),
      result?.ok && line('파일', `${result.folder}/${result.file}`),
      result?.passphraseCreated && line('암호', '처음 백업이라 암호를 새로 만들어 맥 키체인에 넣었어요. 맥에서 backup.sh --print-passphrase 로 확인해 따로 적어 두세요.'),
      ...(result?.warnings || []).map((warning, index) => h('div', { key: index, style: { color: '#B45309', fontSize: 'var(--font-size-sm)' } }, `주의: ${warning}`))
    ),
    h('div', { style: { display: 'flex', gap: '8px' } },
      h('button', { type: 'button', className: 'btn btn-primary', disabled: busy || pending, onClick: () => load('request') }, pending ? '맥이 확인하길 기다리는 중' : '지금 백업'),
      h('button', { type: 'button', className: 'btn', disabled: busy, onClick: () => load('status') }, '새로고침')
    )
  );
}
