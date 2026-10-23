const SOURCE_LABELS = {
  'culture-portal': '문화포털',
  kopis: 'KOPIS',
  interpark: '인터파크',
  timeticket: '타임티켓',
  'yes24-exclusive': 'YES24'
};

export function CultureSourceLinks({ selected }) {
  const React = window.React;
  const listings = Array.isArray(selected?.sourceListings)
    ? selected.sourceListings.filter(listing => listing && (listing.link || listing.website))
    : [];
  if (listings.length < 2) return null;
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' } },
    React.createElement('span', { style: { color: 'var(--text-muted)', fontWeight: 700, fontSize: 'var(--font-size-sm)' } }, '예약·상세 링크'),
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } }, listings.map(listing => {
      const href = String(listing.link || listing.website || '').trim();
      return React.createElement('a', {
        key: `${listing.source || 'source'}-${href}`, href, target: '_blank', rel: 'noopener noreferrer',
        style: { display: 'inline-flex', alignItems: 'center', minHeight: '32px', padding: '0 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--accent-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 800, textDecoration: 'none' }
      }, SOURCE_LABELS[String(listing.source || '').trim()] || String(listing.source || '예약처'));
    }))
  );
}
