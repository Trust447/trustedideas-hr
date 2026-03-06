// src/components/ui/Pagination.jsx
import Icon from './Icon.jsx';

export default function Pagination({ page, totalPages, total, perPage, onPage }) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  // Build page window: always show first, last, current ±1, with ellipsis
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderTop: '1px solid var(--border)',
      flexWrap: 'wrap', gap: 10,
    }}>
      <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> results
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <Icon name="chevronDown" size={14} style={{ transform: 'rotate(90deg)' }} />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--ink-muted)', fontSize: 13 }}>…</span>
          ) : (
            <button
              key={p}
              className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onPage(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              style={{ minWidth: 34, justifyContent: 'center' }}
            >
              {p}
            </button>
          )
        )}

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <Icon name="chevronDown" size={14} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      </div>
    </div>
  );
}
