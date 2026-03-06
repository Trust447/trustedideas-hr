// src/pages/reports/ReportsPage.jsx
// Analytics dashboard — 5 modules with live data, charts, and PDF export.
// Each module: summary stats → visual chart → data table → Export PDF button.

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../hooks/useToast.jsx';
import { reportsApi, MOCK_REPORTS } from '../../services/reportsApi.js';
import { exportReportPDF } from '../../utils/pdfExport.js';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { SkeletonStatGrid, SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { ErrorBanner } from '../../components/ui/ErrorDisplay.jsx';
import { formatCurrency } from '../../utils/formatters.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const MODULES = [
  { id: 'headcount',   label: 'Headcount',   icon: '👥', color: 'blue'   },
  { id: 'attendance',  label: 'Attendance',  icon: '📅', color: 'green'  },
  { id: 'leave',       label: 'Leave',       icon: '🏖',  color: 'amber'  },
  { id: 'payroll',     label: 'Payroll',     icon: '💰', color: 'accent' },
  { id: 'performance', label: 'Performance', icon: '⭐', color: 'purple' },
];

// ── Date range helper ─────────────────────────────────────────
function thisYear() {
  const y = new Date().getFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31`, label: `Jan – Dec ${y}` };
}

// ── Mini bar chart (pure CSS/HTML, no library) ────────────────
function BarChart({ items = [], color = 'var(--accent)', height = 100, showLabels = true }) {
  const maxVal = Math.max(...items.map((i) => i.value ?? 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, paddingTop: 20 }}>
      {items.map((item, i) => {
        const pct = Math.round(((item.value ?? 0) / maxVal) * 100);
        return (
          <div key={i} title={`${item.label}: ${item.value}`}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 9, color: 'var(--ink-muted)', fontWeight: 600 }}>{item.value}</span>
            <div style={{ width: '100%', height: `${pct}%`, background: color, borderRadius: '3px 3px 0 0', minHeight: 4, transition: 'height 600ms ease', opacity: 0.85 }} />
            {showLabels && <span style={{ fontSize: 9, color: 'var(--ink-light)', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', textOverflow: 'ellipsis' }}>{item.label}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── Horizontal bar row ────────────────────────────────────────
function HBar({ label, value, max, hint, color = 'var(--accent)' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 110, fontSize: 12, fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={label}>{label}</div>
      <div style={{ flex: 1, height: 8, background: 'var(--cream-dark)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 600ms ease' }} />
      </div>
      <div style={{ width: 80, fontSize: 12, color: 'var(--ink-muted)', textAlign: 'right', flexShrink: 0 }}>{hint}</div>
    </div>
  );
}

// ── Rating stars display ──────────────────────────────────────
function RatingStars({ rating }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? '#FCD34D' : 'var(--border)', fontSize: 13 }}>★</span>
      ))}
    </span>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Module panels
// ─────────────────────────────────────────────────────────────

function HeadcountReport({ data, loading, error, onRefetch }) {
  const d = data ?? MOCK_REPORTS.headcount;
  const s = d.summary ?? {};
  const maxDept = Math.max(...(d.by_department?.map((x) => x.count) ?? [1]));

  if (loading) return <><SkeletonStatGrid count={4} /><SkeletonCard lines={5} /></>;
  if (error)   return <ErrorBanner error={error} onRetry={onRefetch} />;

  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginBottom: 24 }}>
        <StatCard label="Total"        value={String(s.total)}            color="blue"   icon="👥" />
        <StatCard label="Active"       value={String(s.active)}           color="green"  icon="✅" />
        <StatCard label="New (30d)"    value={String(s.new_hires_30d)}    color="accent" icon="🆕" sub={`+${s.new_hires_30d} hires`} />
        <StatCard label="Growth"       value={`${s.growth_pct}%`}         color="purple" icon="📈" />
      </div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <Section title="Monthly trend">
            <BarChart items={d.trend?.map((t) => ({ label: t.month, value: t.total })) ?? []} color="var(--blue)" />
          </Section>
        </div>
        <div className="card">
          <Section title="By Department">
            {d.by_department?.map((dep) => (
              <HBar key={dep.name} label={dep.name} value={dep.count} max={maxDept}
                hint={`${dep.count} (${dep.pct}%)`} color="#1E40AF" />
            ))}
          </Section>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>Department Breakdown</span>
        </div>
        <table>
          <thead><tr><th>Department</th><th>Headcount</th><th>Share</th><th>New Hires</th></tr></thead>
          <tbody>
            {d.by_department?.map((dep) => (
              <tr key={dep.name}>
                <td style={{ fontWeight: 500 }}>{dep.name}</td>
                <td>{dep.count}</td>
                <td><span style={{ color: 'var(--ink-muted)' }}>{dep.pct}%</span></td>
                <td style={{ color: 'var(--green)' }}>+{dep.new_hires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AttendanceReport({ data, loading, error, onRefetch }) {
  const d = data ?? MOCK_REPORTS.attendance;
  const s = d.summary ?? {};

  if (loading) return <><SkeletonStatGrid count={4} /><SkeletonCard lines={5} /></>;
  if (error)   return <ErrorBanner error={error} onRetry={onRefetch} />;

  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginBottom: 24 }}>
        <StatCard label="Avg Attendance"  value={`${s.avg_attendance_pct}%`}  color="green"  icon="✅" />
        <StatCard label="Avg Hours/Day"   value={`${s.avg_hours_per_day}h`}   color="blue"   icon="⏱" />
        <StatCard label="Total Check-ins" value={String(s.total_check_ins)}   color="accent" icon="📥" />
        <StatCard label="Total Absences"  value={String(s.total_absences)}    color="red"    icon="❌" />
      </div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <Section title="Monthly Present">
            <BarChart items={d.trend?.map((t) => ({ label: t.month, value: t.present })) ?? []} color="var(--green)" />
          </Section>
        </div>
        <div className="card">
          <Section title="Avg Attendance by Dept (%)">
            {d.by_department?.map((dep) => (
              <HBar key={dep.name} label={dep.name} value={dep.avg_pct} max={100}
                hint={`${dep.avg_pct}%`} color="#2D6A4F" />
            ))}
          </Section>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>Monthly Detail</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Month</th><th>Present</th><th>Absent</th><th>Late</th><th>Avg Hours</th></tr></thead>
            <tbody>
              {d.trend?.map((t) => (
                <tr key={t.month}>
                  <td style={{ fontWeight: 500 }}>{t.month}</td>
                  <td style={{ color: 'var(--green)' }}>{t.present}</td>
                  <td style={{ color: 'var(--red)' }}>{t.absent}</td>
                  <td style={{ color: 'var(--amber)' }}>{t.late}</td>
                  <td>{t.avg_hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function LeaveReport({ data, loading, error, onRefetch }) {
  const d = data ?? MOCK_REPORTS.leave;
  const s = d.summary ?? {};
  const maxType = Math.max(...(d.by_type?.map((t) => t.count) ?? [1]));

  if (loading) return <><SkeletonStatGrid count={4} /><SkeletonCard lines={5} /></>;
  if (error)   return <ErrorBanner error={error} onRetry={onRefetch} />;

  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginBottom: 24 }}>
        <StatCard label="Total Requests"  value={String(s.total_requests)}  color="blue"  icon="📋" />
        <StatCard label="Approved"        value={String(s.approved)}        color="green" icon="✅" />
        <StatCard label="Rejected"        value={String(s.rejected)}        color="red"   icon="❌" />
        <StatCard label="Days Taken"      value={String(s.total_days_taken)} color="amber" icon="📅" />
      </div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <Section title="Requests by Type">
            {d.by_type?.map((t) => (
              <HBar key={t.type} label={t.type} value={t.count} max={maxType}
                hint={`${t.count} req · ${t.days}d`} color="#B45309" />
            ))}
          </Section>
        </div>
        <div className="card">
          <Section title="Monthly Requests">
            <BarChart items={d.trend?.map((t) => ({ label: t.month, value: t.requests })) ?? []} color="var(--amber)" />
          </Section>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>Leave by Department</span>
        </div>
        <table>
          <thead><tr><th>Department</th><th>Total</th><th>Approved</th><th>Rejected</th><th>Avg Days</th></tr></thead>
          <tbody>
            {d.by_department?.map((dep) => (
              <tr key={dep.name}>
                <td style={{ fontWeight: 500 }}>{dep.name}</td>
                <td>{dep.total}</td>
                <td style={{ color: 'var(--green)' }}>{dep.approved}</td>
                <td style={{ color: 'var(--red)' }}>{dep.rejected}</td>
                <td>{dep.avg_days}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PayrollReport({ data, loading, error, onRefetch }) {
  const d = data ?? MOCK_REPORTS.payroll;
  const s = d.summary ?? {};
  const maxGross = Math.max(...(d.by_department?.map((x) => x.total_gross) ?? [1]));

  if (loading) return <><SkeletonStatGrid count={4} /><SkeletonCard lines={5} /></>;
  if (error)   return <ErrorBanner error={error} onRetry={onRefetch} />;

  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginBottom: 24 }}>
        <StatCard label="Total Gross"   value={formatCurrency(s.total_gross,  true)} color="accent" icon="💰" />
        <StatCard label="Total Net"     value={formatCurrency(s.total_net,    true)} color="green"  icon="✅" />
        <StatCard label="Total Bonuses" value={formatCurrency(s.total_bonuses,true)} color="blue"   icon="🎁" />
        <StatCard label="Avg Salary"    value={formatCurrency(s.avg_salary,   true)} color="purple" icon="👤" sub="per employee" />
      </div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <Section title="Monthly Gross Payroll">
            <BarChart items={d.trend?.map((t) => ({ label: t.month, value: Math.round(t.gross / 1000) })) ?? []}
              color="var(--accent)" />
            <div style={{ fontSize: 11, color: 'var(--ink-light)', textAlign: 'center', marginTop: 4 }}>Values in $k</div>
          </Section>
        </div>
        <div className="card">
          <Section title="Payroll by Department">
            {d.by_department?.map((dep) => (
              <HBar key={dep.name} label={dep.name} value={dep.total_gross} max={maxGross}
                hint={formatCurrency(dep.total_gross, true)} color="#C4622D" />
            ))}
          </Section>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>Monthly Payroll Detail</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Month</th><th>Gross</th><th>Net</th><th>Bonuses</th></tr></thead>
            <tbody>
              {d.trend?.map((t) => (
                <tr key={t.month}>
                  <td style={{ fontWeight: 500 }}>{t.month}</td>
                  <td>{formatCurrency(t.gross)}</td>
                  <td>{formatCurrency(t.net)}</td>
                  <td style={{ color: 'var(--green)' }}>+{formatCurrency(t.bonuses)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function PerformanceReport({ data, loading, error, onRefetch }) {
  const d = data ?? MOCK_REPORTS.performance;
  const s = d.summary ?? {};
  const maxDist = Math.max(...(d.distribution?.map((x) => x.count) ?? [1]));

  if (loading) return <><SkeletonStatGrid count={4} /><SkeletonCard lines={5} /></>;
  if (error)   return <ErrorBanner error={error} onRetry={onRefetch} />;

  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginBottom: 24 }}>
        <StatCard label="Avg Rating"       value={`${s.avg_rating} / 5`}        color="accent" icon="⭐" />
        <StatCard label="Reviews Done"     value={String(s.reviews_completed)}  color="blue"   icon="📋" />
        <StatCard label="Top Performers"   value={String(s.top_performers)}     color="green"  icon="🏆" sub="≥ 4 stars" />
        <StatCard label="Needs Attention"  value={String(s.needs_attention)}    color="red"    icon="⚠️" sub="≤ 2 stars" />
      </div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <Section title="Rating Distribution">
            {d.distribution?.map((row) => {
              const colors = { 5: '#2D6A4F', 4: '#3B82F6', 3: '#B45309', 2: '#F97316', 1: '#9B1C1C' };
              return (
                <HBar key={row.rating}
                  label={`${'★'.repeat(row.rating)}${'☆'.repeat(5 - row.rating)} ${row.label}`}
                  value={row.count} max={maxDist}
                  hint={`${row.count} employees`}
                  color={colors[row.rating] ?? 'var(--accent)'} />
              );
            })}
          </Section>
        </div>
        <div className="card">
          <Section title="Avg Rating by Dept">
            {d.by_department?.map((dep) => (
              <div key={dep.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13 }}>{dep.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RatingStars rating={dep.avg_rating} />
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)', width: 28 }}>{dep.avg_rating}</span>
                </div>
              </div>
            ))}
          </Section>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>Performance by Department</span>
        </div>
        <table>
          <thead><tr><th>Department</th><th>Avg Rating</th><th>Reviewed</th><th>Top Performers</th></tr></thead>
          <tbody>
            {d.by_department?.map((dep) => (
              <tr key={dep.name}>
                <td style={{ fontWeight: 500 }}>{dep.name}</td>
                <td><RatingStars rating={dep.avg_rating} /> <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{dep.avg_rating}</span></td>
                <td>{dep.reviewed}</td>
                <td style={{ color: 'var(--green)' }}>{dep.top_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Reports Page
// ─────────────────────────────────────────────────────────────

const REPORT_FETCHERS = {
  headcount:   reportsApi.headcount,
  attendance:  reportsApi.attendance,
  leave:       reportsApi.leave,
  payroll:     reportsApi.payroll,
  performance: reportsApi.performance,
};

const REPORT_PANELS = {
  headcount:   HeadcountReport,
  attendance:  AttendanceReport,
  leave:       LeaveReport,
  payroll:     PayrollReport,
  performance: PerformanceReport,
};

export default function ReportsPage() {
  const { user }  = useAuth();
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState('headcount');
  const [dateRange,    setDateRange]    = useState(thisYear());
  const [exporting,    setExporting]    = useState(false);

  const params = { date_from: dateRange.from, date_to: dateRange.to };
  const fetcher = USE_MOCK
    ? async () => ({ data: MOCK_REPORTS[activeModule] })
    : REPORT_FETCHERS[activeModule];

  const { data: rawData, loading, error, refetch } = useApi(fetcher, params, [activeModule, dateRange.from, dateRange.to]);
  const reportData = USE_MOCK ? MOCK_REPORTS[activeModule] : (rawData ?? MOCK_REPORTS[activeModule]);

  const ReportPanel = REPORT_PANELS[activeModule];
  const activeInfo  = MODULES.find((m) => m.id === activeModule);

  const handleExportPDF = useCallback(() => {
    if (!reportData) { toast.error('No data to export'); return; }
    setExporting(true);
    try {
      exportReportPDF(activeModule, reportData, {
        company:     user?.company_name ?? 'Trusted Ideas HR',
        dateRange:   dateRange.label,
        generatedBy: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
      });
      toast.success("PDF opened — use your browser's Save as PDF option");
    } catch (e) {
      toast.error('PDF export failed: ' + e.message);
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  }, [activeModule, reportData, dateRange, user, toast]);

  // Date preset helpers
  const applyPreset = (preset) => {
    const y = new Date().getFullYear();
    const m = new Date().getMonth();
    const presets = {
      ytd:   { from: `${y}-01-01`,  to: new Date().toISOString().split('T')[0], label: `Jan – Now ${y}` },
      q1:    { from: `${y}-01-01`,  to: `${y}-03-31`, label: `Q1 ${y}` },
      q2:    { from: `${y}-04-01`,  to: `${y}-06-30`, label: `Q2 ${y}` },
      q3:    { from: `${y}-07-01`,  to: `${y}-09-30`, label: `Q3 ${y}` },
      q4:    { from: `${y}-10-01`,  to: `${y}-12-31`, label: `Q4 ${y}` },
      last30:{ from: new Date(Date.now()-30*86400000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0], label: 'Last 30 days' },
    };
    if (presets[preset]) setDateRange(presets[preset]);
  };

  return (
    <div className="page fade-in">
      {/* Page header */}
      <div className="page-header page-header-row">
        <div>
          <h1>Reports & Analytics</h1>
          <p>{dateRange.label}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting || loading}>
            <Icon name="download" size={14} />
            {exporting ? 'Preparing…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Date range controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['ytd','YTD'],['q1','Q1'],['q2','Q2'],['q3','Q3'],['q4','Q4'],['last30','30d']].map(([key,label]) => (
            <button key={key} className={`btn btn-sm ${dateRange.label === label ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => applyPreset(key)} style={{ minWidth: 44 }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
          <input className="form-input" type="date" value={dateRange.from} style={{ width: 'auto' }}
            onChange={(e) => setDateRange((d) => ({ ...d, from: e.target.value, label: `${e.target.value} – ${d.to}` }))} />
          <span style={{ color: 'var(--ink-muted)', fontSize: 13 }}>to</span>
          <input className="form-input" type="date" value={dateRange.to} style={{ width: 'auto' }}
            onChange={(e) => setDateRange((d) => ({ ...d, to: e.target.value, label: `${d.from} – ${e.target.value}` }))} />
        </div>
      </div>

      {/* Module tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {MODULES.map((m) => {
          const active = activeModule === m.id;
          return (
            <button key={m.id}
              onClick={() => setActiveModule(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 'var(--radius-sm)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent-pale)' : 'white',
                color: active ? 'var(--accent)' : 'var(--ink-muted)',
                fontWeight: active ? 600 : 400,
                fontSize: 13, cursor: 'pointer',
                transition: 'all var(--transition)',
              }}>
              {m.icon} {m.label}
            </button>
          );
        })}
      </div>

      {/* Active module panel */}
      <div className="fade-in" key={activeModule}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>
            {activeInfo?.icon} {activeInfo?.label} Report
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={refetch} disabled={loading}>
            <Icon name="trending" size={14} />
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        <ReportPanel
          data={reportData}
          loading={loading && !USE_MOCK}
          error={error}
          onRefetch={refetch}
        />
      </div>
    </div>
  );
}
