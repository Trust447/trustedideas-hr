// src/pages/payroll/PayrollPage.jsx
import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi.js';
import { useToast } from '../../hooks/useToast.jsx';
import { payrollApi } from '../../services/api.js';
import Icon from '../../components/ui/Icon.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { ErrorBanner } from '../../components/ui/ErrorDisplay.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function PayrollPage() {
  const { toast } = useToast();
  const thisMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const paymentDate = month + '-01';

  const { data: records, meta, loading, error, page, setPage, refetch } = useApi(
    payrollApi.list,
    { payment_date: paymentDate },
    [paymentDate]
  );

  const summary = useApi(payrollApi.summary, { payment_date: paymentDate }, [paymentDate]);
  const s = summary.data ?? {};

  const { mutate: runPayroll, loading: running } = useMutation(
    () => payrollApi.run(paymentDate, []),
    {
      onSuccess: () => { toast.success('Payroll run initiated — processing in background'); refetch(); summary.refetch(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  return (
    <div className="page fade-in">
      <div className="page-header page-header-row">
        <div>
          <h1>Payroll</h1>
          <p>{month} payroll cycle</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="form-input" type="month" value={month}
            onChange={(e) => setMonth(e.target.value)} style={{ width: 'auto' }} />
          <button className="btn btn-secondary"><Icon name="download" size={14} /> Export</button>
          <button className="btn btn-primary" disabled={running}
            onClick={() => runPayroll().catch(() => {})}>
            <Icon name="trending" size={14} />
            {running ? 'Running…' : 'Run Payroll'}
          </button>
        </div>
      </div>

      <ErrorBanner error={error || summary.error} onRetry={() => { refetch(); summary.refetch(); }} />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <StatCard label="Total Net Pay"  value={s.total_net_pay  ? formatCurrency(s.total_net_pay,  true) : '—'} color="accent" icon="💰" />
        <StatCard label="Base Salary"    value={s.total_salary   ? formatCurrency(s.total_salary,   true) : '—'} color="blue"   icon="💼" />
        <StatCard label="Total Bonuses"  value={s.total_bonus    ? formatCurrency(s.total_bonus,    true) : '—'} color="green"  icon="🎁" />
        <StatCard label="Employees Paid" value={s.employee_count ? String(s.employee_count)               : '—'} color="amber"  icon="✅" />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>Payroll Records</h3>
          {!loading && records?.length > 0 && <Badge status="active">All Processed</Badge>}
        </div>

        {loading ? <SkeletonTable rows={8} cols={6} /> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th><th>Base Salary</th><th>Bonus</th>
                    <th>Deductions</th><th>Net Pay</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(records ?? []).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar firstName={p.employee_name?.split(' ')[0]} lastName={p.employee_name?.split(' ')[1]} />
                          <span className="td-name">{p.employee_name}</span>
                        </div>
                      </td>
                      <td>{formatCurrency(p.salary)}</td>
                      <td style={{ color: p.bonus > 0 ? 'var(--green)' : 'var(--ink-light)' }}>
                        {p.bonus > 0 ? `+${formatCurrency(p.bonus)}` : '—'}
                      </td>
                      <td style={{ color: 'var(--red)' }}>-{formatCurrency(p.deductions)}</td>
                      <td style={{ fontWeight: 600, fontSize: 14 }}>{formatCurrency(p.net_pay)}</td>
                      <td><Badge status={p.status}>{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {s.total_net_pay && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--cream)', display: 'flex', justifyContent: 'flex-end', gap: 32, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                  Total Deductions: <strong style={{ color: 'var(--red)' }}>-{formatCurrency(s.total_deductions ?? 0)}</strong>
                </span>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
                  Total Net: <strong style={{ color: 'var(--ink)', fontSize: 15 }}>{formatCurrency(s.total_net_pay)}</strong>
                </span>
              </div>
            )}
            {meta && (
              <Pagination page={page} totalPages={meta.total_pages} total={meta.total}
                perPage={meta.per_page} onPage={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
