// src/pages/dashboard/DashboardPage.jsx
import { useAuth }            from '../../hooks/useAuth.jsx';
import { useApi, useMutation } from '../../hooks/useApi.js';
import { useToast }           from '../../hooks/useToast.jsx';
import StatCard               from '../../components/ui/StatCard.jsx';
import Avatar                 from '../../components/ui/Avatar.jsx';
import Badge                  from '../../components/ui/Badge.jsx';
import Icon                   from '../../components/ui/Icon.jsx';
import { SkeletonStatGrid, SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { ErrorBanner }        from '../../components/ui/ErrorDisplay.jsx';
import { leaveApi, employeesApi, attendanceApi, payrollApi, dashboardApi } from '../../services/api.js';
import { formatCurrency }     from '../../utils/formatters.js';

export default function DashboardPage() {
  const { user }  = useAuth();
  const { toast } = useToast();

  // ── Data fetching ────────────────────────────────────────────
  const employees  = useApi(employeesApi.list,      { per_page: 1 });
  const attendance = useApi(attendanceApi.summary,  {});
  const leave      = useApi(leaveApi.list,          { status: 'pending', per_page: 5 });
  const payroll    = useApi(payrollApi.summary,     {});
  const activity   = useApi(dashboardApi.activity,  {});

  // ── Leave approval ───────────────────────────────────────────
  const { mutate: processLeave, loading: processingLeave } = useMutation(
    (id, status) => leaveApi.process(id, status),
    {
      onSuccess: (_d, args) => {
        toast.success(`Leave ${args[1]}`);
        leave.refetch();
      },
      onError: (msg) => toast.error(msg),
    }
  );

  const totalEmployees = employees.meta?.total ?? DASH_FALLBACK.total;
  const pendingList    = leave.data    ?? [];
  const attn           = attendance.data ?? {};
  const pay            = payroll.data    ?? {};
  const activityList   = Array.isArray(activity.data) ? activity.data : [];

  const isLoading = employees.loading && attendance.loading;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1>Good morning, {user?.first_name} 👋</h1>
        <p>Here's what's happening at Zenith Forge today.</p>
      </div>

      <ErrorBanner error={employees.error || attendance.error}
        onRetry={() => { employees.refetch(); attendance.refetch(); }} />

      {/* ── Stat cards ── */}
      {isLoading
        ? <SkeletonStatGrid count={6} />
        : (
          <div className="stats-grid">
            <StatCard
              label="Total Employees"
              value={String(totalEmployees)}
              sub="Active headcount"
              color="blue" icon="👥" />
            <StatCard
              label="Present Today"
              value={String(attn.total_present ?? '—')}
              sub={`${attn.total_checked_out ?? 0} checked out`}
              color="green" icon="✅" />
            <StatCard
              label="Still In Office"
              value={String(attn.missing_checkouts ?? '—')}
              sub="Haven't checked out"
              color="amber" icon="⏳" />
            <StatCard
              label="On Leave Today"
              value={String(attn.on_leave ?? '—')}
              sub="Approved absences"
              color="purple" icon="🏖" />
            <StatCard
              label="Monthly Payroll"
              value={pay.total_net_pay ? formatCurrency(pay.total_net_pay, true) : '—'}
              sub={`${pay.employee_count ?? '—'} employees paid`}
              color="accent" icon="💰" />
            <StatCard
              label="Avg Hours Today"
              value={attn.avg_hours ? `${attn.avg_hours}h` : '—'}
              sub="Across checked-out staff"
              color="green" icon="⏱" />
          </div>
        )
      }

      <div className="grid-2">
        {/* ── Pending Leave ── */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:17 }}>Pending Leave</h3>
            {!leave.loading && <Badge status="pending">{pendingList.length} pending</Badge>}
          </div>
          <ErrorBanner error={leave.error} onRetry={leave.refetch} />
          {!leave.loading && pendingList.length === 0 && (
            <div style={{ textAlign:'center', padding:'24px 0', color:'var(--ink-muted)', fontSize:13 }}>
              🎉 No pending leave requests
            </div>
          )}
          {pendingList.map((l) => (
            <div key={l.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:'1px solid var(--cream-dark)' }}>
              <Avatar firstName={l.employee_name?.split(' ')[0]} lastName={l.employee_name?.split(' ')[1]} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:500, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {l.employee_name}
                </div>
                <div style={{ fontSize:12, color:'var(--ink-muted)' }}>
                  {l.reason} · {l.days_requested}d · {l.start_date}
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                <button className="btn btn-sm btn-success" disabled={processingLeave}
                  title="Approve"
                  onClick={() => processLeave(l.id, 'approved').catch(() => {})}>
                  <Icon name="check" size={13} />
                </button>
                <button className="btn btn-sm btn-danger" disabled={processingLeave}
                  title="Reject"
                  onClick={() => processLeave(l.id, 'rejected').catch(() => {})}>
                  <Icon name="x" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Attendance breakdown ── */}
        <div className="card">
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:17, marginBottom:4 }}>
            Today's Attendance
          </h3>
          <p style={{ fontSize:12, color:'var(--ink-muted)', marginBottom:20 }}>
            {new Date().toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long' })}
          </p>

          {attendance.loading ? <SkeletonCard lines={3} /> : (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {[
                { label:'Checked In & Out',  value: attn.total_checked_out, color:'#2D6A4F', bg:'#E8F5EE' },
                { label:'Still In Office',   value: attn.missing_checkouts, color:'#B45309', bg:'#FEF3C7' },
                { label:'On Leave',          value: attn.on_leave,          color:'#1E40AF', bg:'#EFF6FF' },
              ].map((row) => {
                const pct = attn.total_present > 0 && row.value != null
                  ? Math.min(100, Math.round((row.value / attn.total_present) * 100))
                  : 0;
                return (
                  <div key={row.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:500 }}>{row.label}</span>
                      <span style={{ fontSize:13, fontWeight:600, color: row.color }}>
                        {row.value ?? '—'} <span style={{ color:'var(--ink-muted)', fontWeight:400 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height:8, background:'var(--cream-dark)', borderRadius:4, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:row.color, borderRadius:4, transition:'width 600ms ease' }} />
                    </div>
                  </div>
                );
              })}
              {attn.avg_hours && (
                <div style={{ padding:'10px 14px', background:'var(--cream)', borderRadius:8, fontSize:13, display:'flex', justifyContent:'space-between' }}>
                  <span>⏱ Average work hours today</span>
                  <strong>{attn.avg_hours}h</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Activity feed ── */}
      <div className="card" style={{ marginTop:0 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:17, marginBottom:16 }}>Recent Activity</h3>
        {activity.loading
          ? <SkeletonCard lines={4} />
          : activityList.map((a, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 0', borderBottom: i < activityList.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:a.color, marginTop:5, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:'var(--ink)' }}>{a.text}</div>
                <div style={{ fontSize:11, color:'var(--ink-light)', marginTop:2 }}>{a.time}</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

const DASH_FALLBACK = { total: 48 };
