// src/components/ui/Skeleton.jsx
// Animated placeholder for loading states.
// Usage: <Skeleton width="100%" height={20} />
//        <SkeletonTable rows={5} cols={5} />
//        <SkeletonCard />

const pulse = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

const base = {
  background: 'linear-gradient(90deg, var(--cream-dark) 25%, var(--cream-mid) 50%, var(--cream-dark) 75%)',
  backgroundSize: '800px 100%',
  animation: 'shimmer 1.4s ease infinite',
  borderRadius: 'var(--radius-sm)',
  display: 'block',
};

export default function Skeleton({ width = '100%', height = 16, style = {} }) {
  return (
    <>
      <style>{pulse}</style>
      <span style={{ ...base, width, height, ...style }} aria-hidden="true" />
    </>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <>
      <style>{pulse}</style>
      <div className="table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {Array.from({ length: cols }, (_, i) => (
                <th key={i} style={{ padding: '12px 16px', background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
                  <Skeleton height={12} width={`${60 + (i * 7) % 30}%`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }, (_, c) => (
                  <td key={c} style={{ padding: '13px 16px', borderBottom: '1px solid var(--cream-dark)' }}>
                    {c === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Skeleton width={32} height={32} style={{ borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <Skeleton height={13} width="70%" style={{ marginBottom: 5 }} />
                          <Skeleton height={11} width="50%" />
                        </div>
                      </div>
                    ) : (
                      <Skeleton height={13} width={`${50 + (r * c * 3) % 40}%`} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <>
      <style>{pulse}</style>
      <div className="card">
        <Skeleton height={18} width="40%" style={{ marginBottom: 16 }} />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} height={13} width={`${90 - i * 10}%`} style={{ marginBottom: 10 }} />
        ))}
      </div>
    </>
  );
}

export function SkeletonStatGrid({ count = 6 }) {
  return (
    <div className="stats-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="stat-card blue" style={{ opacity: 0.6 }}>
          <Skeleton height={11} width="60%" style={{ marginBottom: 10 }} />
          <Skeleton height={28} width="45%" style={{ marginBottom: 8 }} />
          <Skeleton height={11} width="70%" />
        </div>
      ))}
    </div>
  );
}
