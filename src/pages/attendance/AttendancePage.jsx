// src/pages/attendance/AttendancePage.jsx
import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { attendanceApi } from '../../services/api.js';
import Icon from '../../components/ui/Icon.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { ErrorBanner } from '../../components/ui/ErrorDisplay.jsx';
import { formatTime } from '../../utils/formatters.js';

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const summary = useApi(attendanceApi.summary, { date }, [date]);
  const records = useApi(attendanceApi.list,    { date }, [date]);

  const s = summary.data ?? {};

  return (
    <div className="page fade-in">
      <div className="page-header page-header-row">
        <div>
          <h1>Attendance</h1>
          <p>Track daily check-ins and work hours</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="form-input" type="date" value={date}
            onChange={(e) => setDate(e.target.value)} style={{ width: 'auto' }} />
          <button className="btn btn-secondary">
            <Icon name="download" size={14} /> Export
          </button>
        </div>
      </div>

      <ErrorBanner error={summary.error || records.error} onRetry={() => { summary.refetch(); records.refetch(); }} />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <StatCard label="Present"      value={String(s.total_present      ?? '—')} color="green" icon="✅" />
        <StatCard label="Checked Out"  value={String(s.total_checked_out  ?? '—')} color="blue"  icon="🚪" />
        <StatCard label="Still In"     value={String(s.missing_checkouts  ?? '—')} color="amber" icon="⏳" />
        <StatCard label="Avg Hours"    value={s.avg_hours ? `${s.avg_hours}h` : '—'} color="accent" icon="⏱" />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {records.loading
          ? <SkeletonTable rows={8} cols={5} />
          : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(records.data ?? []).map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar firstName={a.employee_name?.split(' ')[0]} lastName={a.employee_name?.split(' ')[1]} />
                            <span className="td-name">{a.employee_name}</span>
                          </div>
                        </td>
                        <td>{formatTime(a.check_in)}</td>
                        <td className={a.check_out ? '' : 'td-muted'}>{a.check_out ? formatTime(a.check_out) : '—'}</td>
                        <td>
                          {a.hours_worked
                            ? `${a.hours_worked}h`
                            : <span className="animate-pulse" style={{ color: 'var(--amber)' }}>Active</span>
                          }
                        </td>
                        <td>
                          <Badge status={a.check_out ? 'active' : 'pending'}>
                            {a.check_out ? 'Complete' : 'In office'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {records.meta && (
                <Pagination page={records.page} totalPages={records.meta.total_pages}
                  total={records.meta.total} perPage={records.meta.per_page} onPage={records.setPage} />
              )}
            </>
          )
        }
      </div>
    </div>
  );
}
