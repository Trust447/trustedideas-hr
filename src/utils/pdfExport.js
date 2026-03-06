// src/utils/pdfExport.js
// Client-side PDF generation using the browser's print API with a styled
// print stylesheet. No external PDF library needed — generates pixel-perfect
// output that matches the screen design.
//
// Usage:
//   import { exportReportPDF } from '../utils/pdfExport.js';
//   exportReportPDF('headcount', reportData, { company: 'Acme', dateRange: '...' });

/**
 * Opens a new print-optimised window with the report content,
 * then triggers window.print() for native PDF save.
 *
 * @param {string} reportType  — 'headcount' | 'attendance' | 'leave' | 'payroll' | 'performance'
 * @param {object} data        — Report data object from reportsApi
 * @param {object} meta        — { company, dateRange, generatedBy }
 */
export function exportReportPDF(reportType, data, meta = {}) {
  const html    = buildReportHTML(reportType, data, meta);
  const win     = window.open('', '_blank', 'width=900,height=700');
  if (!win) { alert('Please allow popups to export PDF'); return; }

  win.document.write(html);
  win.document.close();

  // Give fonts/images time to load before print dialog
  win.onload = () => setTimeout(() => { win.print(); }, 400);
}

// ── HTML builder ─────────────────────────────────────────────────────────────

function buildReportHTML(type, data, meta) {
  const title    = REPORT_TITLES[type] ?? 'Report';
  const sections = buildSections(type, data);
  const now      = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — ${meta.company ?? 'Trusted Ideas HR'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 13px; }
    body { font-family: 'DM Sans', sans-serif; color: #1A1714; background: white; padding: 0; }

    /* ── Page layout ── */
    @page { size: A4; margin: 16mm 14mm; }
    .page { page-break-after: always; }
    .page:last-child { page-break-after: avoid; }

    /* ── Header ── */
    .report-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding-bottom: 16px; border-bottom: 2px solid #C4622D;
      margin-bottom: 28px;
    }
    .report-logo { display: flex; align-items: center; gap: 10px; }
    .report-logo-mark {
      width: 32px; height: 32px; background: #C4622D; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 15px; font-weight: 700;
    }
    .report-company { font-family: 'DM Serif Display', serif; font-size: 15px; color: #1A1714; }
    .report-meta { text-align: right; }
    .report-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1A1714; line-height: 1.2; }
    .report-subtitle { font-size: 11px; color: #6B6560; margin-top: 4px; }

    /* ── Stat grid ── */
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
    .stat-card {
      padding: 14px 16px; border: 1px solid #DDD8CC; border-radius: 10px;
      border-top: 3px solid #C4622D; background: #FAF8F3;
    }
    .stat-label { font-size: 10px; font-weight: 600; color: #6B6560; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
    .stat-value { font-family: 'DM Serif Display', serif; font-size: 26px; color: #1A1714; line-height: 1; }
    .stat-sub   { font-size: 10px; color: #9E9890; margin-top: 4px; }

    /* ── Section ── */
    .section { margin-bottom: 28px; }
    .section-title { font-family: 'DM Serif Display', serif; font-size: 16px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #EDE8DB; }

    /* ── Table ── */
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead tr { background: #F2EEE4; }
    th { padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 600; color: #6B6560; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #DDD8CC; }
    td { padding: 9px 12px; border-bottom: 1px solid #EDE8DB; color: #1A1714; }
    tr:last-child td { border-bottom: none; }
    .td-right { text-align: right; }
    .td-bold  { font-weight: 600; }

    /* ── Bar chart ── */
    .chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; margin-bottom: 8px; }
    .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .bar { width: 100%; border-radius: 3px 3px 0 0; min-height: 4px; }
    .bar-label { font-size: 9px; color: #6B6560; white-space: nowrap; }
    .bar-val   { font-size: 9px; color: #1A1714; font-weight: 600; }

    /* ── Horizontal bar ── */
    .h-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .h-bar-label { width: 100px; font-size: 11px; color: #1A1714; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .h-bar-track { flex: 1; height: 8px; background: #EDE8DB; border-radius: 4px; overflow: hidden; }
    .h-bar-fill  { height: 100%; border-radius: 4px; }
    .h-bar-val   { width: 40px; text-align: right; font-size: 11px; font-weight: 600; color: #1A1714; flex-shrink: 0; }

    /* ── Rating stars ── */
    .stars { color: #FCD34D; font-size: 13px; letter-spacing: 1px; }
    .stars-empty { color: #DDD8CC; }

    /* ── Badge ── */
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
    .badge-green  { background: #E8F5EE; color: #2D6A4F; }
    .badge-amber  { background: #FEF3C7; color: #B45309; }
    .badge-red    { background: #FEE2E2; color: #9B1C1C; }
    .badge-blue   { background: #EFF6FF; color: #1E40AF; }

    /* ── Footer ── */
    .report-footer {
      margin-top: 40px; padding-top: 12px; border-top: 1px solid #EDE8DB;
      display: flex; justify-content: space-between; font-size: 10px; color: #9E9890;
    }

    /* ── Print tweaks ── */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="report-logo">
      <div class="report-logo-mark">TI</div>
      <div class="report-company">${escHtml(meta.company ?? 'Trusted Ideas HR')}</div>
    </div>
    <div class="report-meta">
      <div class="report-title">${title}</div>
      <div class="report-subtitle">
        ${meta.dateRange ? escHtml(meta.dateRange) + ' · ' : ''}Generated ${now}
        ${meta.generatedBy ? ' · ' + escHtml(meta.generatedBy) : ''}
      </div>
    </div>
  </div>

  ${sections}

  <div class="report-footer">
    <span>Trusted Ideas HR · Confidential</span>
    <span>${now}</span>
  </div>

  <script>
    // Auto-close after print (UX convenience)
    window.addEventListener('afterprint', () => window.close());
  <\/script>
</body>
</html>`;
}

// ── Section builders ──────────────────────────────────────────────────────────

const REPORT_TITLES = {
  headcount:   'Headcount & Workforce Overview',
  attendance:  'Attendance Trends Report',
  leave:       'Leave Utilisation Report',
  payroll:     'Payroll Summary Report',
  performance: 'Performance Rating Report',
};

function buildSections(type, data) {
  switch (type) {
    case 'headcount':   return buildHeadcount(data);
    case 'attendance':  return buildAttendance(data);
    case 'leave':       return buildLeave(data);
    case 'payroll':     return buildPayroll(data);
    case 'performance': return buildPerformance(data);
    default:            return '<p>No data</p>';
  }
}

function buildHeadcount(d) {
  const s  = d.summary;
  const maxCount = Math.max(...(d.by_department?.map((x) => x.count) ?? [1]));
  return `
    <div class="stat-grid">
      ${statCard('Total Employees',  s.total,       '')}
      ${statCard('Active',           s.active,      '')}
      ${statCard('New Hires (30d)',   s.new_hires_30d, '↑ growth')}
      ${statCard('Growth',           s.growth_pct + '%', 'last 30 days')}
    </div>

    <div class="section">
      <div class="section-title">Headcount by Department</div>
      ${d.by_department?.map((dep) => hBar(dep.name, dep.count, maxCount, dep.count + ' employees', '#1E40AF')).join('')}
    </div>

    <div class="section">
      <div class="section-title">Monthly Headcount Trend</div>
      ${barChart(d.trend?.map((t) => ({ label: t.month, value: t.total })) ?? [], '#C4622D')}
    </div>

    <div class="section">
      <div class="section-title">Department Breakdown</div>
      <table>
        <thead><tr><th>Department</th><th>Headcount</th><th class="td-right">Share</th><th class="td-right">New Hires</th></tr></thead>
        <tbody>
          ${d.by_department?.map((dep) => `
            <tr>
              <td class="td-bold">${escHtml(dep.name)}</td>
              <td>${dep.count}</td>
              <td class="td-right">${dep.pct}%</td>
              <td class="td-right">${dep.new_hires}</td>
            </tr>`).join('') ?? ''}
        </tbody>
      </table>
    </div>`;
}

function buildAttendance(d) {
  const s = d.summary;
  const maxPresent = Math.max(...(d.trend?.map((t) => t.present) ?? [1]));
  return `
    <div class="stat-grid">
      ${statCard('Avg Attendance',  s.avg_attendance_pct + '%', '')}
      ${statCard('Avg Hours/Day',   s.avg_hours_per_day + 'h',  '')}
      ${statCard('Total Check-ins', s.total_check_ins,          '')}
      ${statCard('Total Absences',  s.total_absences,           '')}
    </div>

    <div class="section">
      <div class="section-title">Monthly Attendance Trend</div>
      ${barChart(d.trend?.map((t) => ({ label: t.month, value: t.present })) ?? [], '#2D6A4F')}
    </div>

    <div class="section">
      <div class="section-title">Attendance by Department</div>
      ${d.by_department?.map((dep) => hBar(dep.name, dep.avg_pct, 100, dep.avg_pct + '%', '#2D6A4F')).join('')}
    </div>

    <div class="section">
      <div class="section-title">Monthly Detail</div>
      <table>
        <thead><tr><th>Month</th><th>Present</th><th>Absent</th><th class="td-right">Late</th><th class="td-right">Avg Hours</th></tr></thead>
        <tbody>
          ${d.trend?.map((t) => `
            <tr>
              <td class="td-bold">${escHtml(t.month)}</td>
              <td>${t.present}</td>
              <td>${t.absent}</td>
              <td class="td-right">${t.late}</td>
              <td class="td-right">${t.avg_hours}h</td>
            </tr>`).join('') ?? ''}
        </tbody>
      </table>
    </div>`;
}

function buildLeave(d) {
  const s = d.summary;
  const maxLeave = Math.max(...(d.by_type?.map((t) => t.count) ?? [1]));
  return `
    <div class="stat-grid">
      ${statCard('Total Requests',  s.total_requests,  '')}
      ${statCard('Approved',        s.approved,        '')}
      ${statCard('Rejected',        s.rejected,        '')}
      ${statCard('Days Taken',      s.total_days_taken, '')}
    </div>

    <div class="section">
      <div class="section-title">Leave by Type</div>
      ${d.by_type?.map((t) => hBar(t.type, t.count, maxLeave, t.count + ' requests · ' + t.days + ' days', '#B45309')).join('')}
    </div>

    <div class="section">
      <div class="section-title">Leave by Department</div>
      <table>
        <thead><tr><th>Department</th><th>Total</th><th>Approved</th><th>Rejected</th><th class="td-right">Avg Days</th></tr></thead>
        <tbody>
          ${d.by_department?.map((dep) => `
            <tr>
              <td class="td-bold">${escHtml(dep.name)}</td>
              <td>${dep.total}</td>
              <td><span class="badge badge-green">${dep.approved}</span></td>
              <td><span class="badge badge-red">${dep.rejected}</span></td>
              <td class="td-right">${dep.avg_days}d</td>
            </tr>`).join('') ?? ''}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Monthly Leave Trend</div>
      ${barChart(d.trend?.map((t) => ({ label: t.month, value: t.requests })) ?? [], '#B45309')}
    </div>`;
}

function buildPayroll(d) {
  const s = d.summary;
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US');
  const maxGross = Math.max(...(d.by_department?.map((x) => x.total_gross) ?? [1]));
  return `
    <div class="stat-grid">
      ${statCard('Total Gross',      fmt(s.total_gross),      '')}
      ${statCard('Total Net',        fmt(s.total_net),        '')}
      ${statCard('Total Bonuses',    fmt(s.total_bonuses),    '')}
      ${statCard('Avg Salary',       fmt(s.avg_salary),       '/employee')}
    </div>

    <div class="section">
      <div class="section-title">Payroll by Department</div>
      ${d.by_department?.map((dep) => hBar(dep.name, dep.total_gross, maxGross, fmt(dep.total_gross) + ' · ' + dep.headcount + ' employees', '#C4622D')).join('')}
    </div>

    <div class="section">
      <div class="section-title">Salary Distribution</div>
      ${barChart(d.salary_bands?.map((b) => ({ label: b.band, value: b.count })) ?? [], '#5B21B6')}
    </div>

    <div class="section">
      <div class="section-title">Monthly Payroll Trend</div>
      <table>
        <thead><tr><th>Month</th><th>Gross</th><th>Net</th><th class="td-right">Bonuses</th></tr></thead>
        <tbody>
          ${d.trend?.map((t) => `
            <tr>
              <td class="td-bold">${escHtml(t.month)}</td>
              <td>${fmt(t.gross)}</td>
              <td>${fmt(t.net)}</td>
              <td class="td-right">${fmt(t.bonuses)}</td>
            </tr>`).join('') ?? ''}
        </tbody>
      </table>
    </div>`;
}

function buildPerformance(d) {
  const s = d.summary;
  const maxDist = Math.max(...(d.distribution?.map((x) => x.count) ?? [1]));
  return `
    <div class="stat-grid">
      ${statCard('Avg Rating',       s.avg_rating + ' / 5',   '')}
      ${statCard('Reviews Done',     s.reviews_completed,     '')}
      ${statCard('Top Performers',   s.top_performers,        '≥ 4 stars')}
      ${statCard('Needs Attention',  s.needs_attention,       '≤ 2 stars')}
    </div>

    <div class="section">
      <div class="section-title">Rating Distribution</div>
      ${d.distribution?.map((row) => hBar(
        '★'.repeat(row.rating) + '☆'.repeat(5 - row.rating) + '  ' + row.label,
        row.count, maxDist,
        row.count + ' employees',
        row.rating >= 4 ? '#2D6A4F' : row.rating === 3 ? '#B45309' : '#9B1C1C'
      )).join('')}
    </div>

    <div class="section">
      <div class="section-title">Performance by Department</div>
      <table>
        <thead><tr><th>Department</th><th>Avg Rating</th><th>Reviewed</th><th class="td-right">Top Performers</th></tr></thead>
        <tbody>
          ${d.by_department?.map((dep) => `
            <tr>
              <td class="td-bold">${escHtml(dep.name)}</td>
              <td>${dep.avg_rating} ★</td>
              <td>${dep.reviewed}</td>
              <td class="td-right">${dep.top_pct}%</td>
            </tr>`).join('') ?? ''}
        </tbody>
      </table>
    </div>`;
}

// ── Shared HTML helpers ───────────────────────────────────────────────────────

function statCard(label, value, sub) {
  return `<div class="stat-card">
    <div class="stat-label">${escHtml(label)}</div>
    <div class="stat-value">${escHtml(String(value))}</div>
    ${sub ? `<div class="stat-sub">${escHtml(sub)}</div>` : ''}
  </div>`;
}

function hBar(label, value, max, hint, color = '#C4622D') {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return `<div class="h-bar-row">
    <span class="h-bar-label" title="${escHtml(label)}">${escHtml(label)}</span>
    <div class="h-bar-track">
      <div class="h-bar-fill" style="width:${pct}%;background:${color}"></div>
    </div>
    <span class="h-bar-val">${escHtml(hint)}</span>
  </div>`;
}

function barChart(items, color = '#C4622D') {
  if (!items?.length) return '<p style="color:#9E9890;font-size:12px">No data</p>';
  const maxVal = Math.max(...items.map((i) => i.value ?? 0), 1);
  const bars = items.map((item) => {
    const pct = Math.round(((item.value ?? 0) / maxVal) * 100);
    return `<div class="bar-wrap">
      <span class="bar-val">${item.value}</span>
      <div class="bar" style="height:${pct}%;background:${color};opacity:0.85"></div>
      <span class="bar-label">${escHtml(item.label)}</span>
    </div>`;
  }).join('');
  return `<div class="chart">${bars}</div>`;
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
