// src/pages/leave/LeavePage.jsx
import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi.js';
import { useToast } from '../../hooks/useToast.jsx';
import { leaveApi, employeesApi } from '../../services/api.js';
import Icon from '../../components/ui/Icon.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { ErrorBanner } from '../../components/ui/ErrorDisplay.jsx';

const TABS = ['all', 'pending', 'approved', 'rejected'];

export default function LeavePage() {
  const { toast } = useToast();
  const [tab,       setTab]       = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newForm,   setNewForm]   = useState({ employee_id: '', start_date: '', end_date: '', reason: '' });

  const { data: requests, meta, loading, error, page, setPage, refetch } = useApi(
    leaveApi.list,
    { status: tab === 'all' ? undefined : tab },
    [tab]
  );

  const counts = useApi(leaveApi.list, { per_page: 1 });
  const pendingCount  = counts.meta?.total ?? 0;

  const { data: employees } = useApi(employeesApi.list, { per_page: 100, status: 'active' });

  const { mutate: processLeave, loading: processing } = useMutation(
    (id, status) => leaveApi.process(id, status),
    {
      onSuccess: (_, [, status]) => {
        toast.success(`Leave ${status}`);
        refetch();
      },
      onError: (msg) => toast.error(msg),
    }
  );

  const { mutate: createLeave, loading: creating, error: createError } = useMutation(
    leaveApi.create,
    {
      onSuccess: () => { toast.success('Leave request submitted'); setShowModal(false); refetch(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  const setField = (k) => (e) => setNewForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createLeave(newForm); } catch { /* handled */ }
  };

  return (
    <div className="page fade-in">
      <div className="page-header page-header-row">
        <div>
          <h1>Leave Management</h1>
          <p>Review and process leave requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={15} /> New Request
        </button>
      </div>

      <ErrorBanner error={error} onRetry={refetch} />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', marginBottom: 24 }}>
        <StatCard label="Pending"  value={String(pendingCount)} color="amber" />
        <StatCard label="Total"    value={meta ? String(meta.total) : '—'} color="blue" />
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => { setTab(t); setPage(1); }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <SkeletonTable rows={6} cols={6} /> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th><th>Reason</th><th>Duration</th>
                    <th>Dates</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(requests ?? []).map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar firstName={l.employee_name?.split(' ')[0]} lastName={l.employee_name?.split(' ')[1]} />
                          <span className="td-name">{l.employee_name}</span>
                        </div>
                      </td>
                      <td className="td-muted">{l.reason}</td>
                      <td><strong>{l.days_requested}</strong> days</td>
                      <td className="td-muted" style={{ fontSize: 12 }}>{l.start_date} → {l.end_date}</td>
                      <td><Badge status={l.status}>{l.status}</Badge></td>
                      <td>
                        {l.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-sm btn-success" disabled={processing}
                              onClick={() => processLeave(l.id, 'approved').catch(() => {})}>
                              <Icon name="check" size={13} /> Approve
                            </button>
                            <button className="btn btn-sm btn-danger" disabled={processing}
                              onClick={() => processLeave(l.id, 'rejected').catch(() => {})}>
                              <Icon name="x" size={13} /> Reject
                            </button>
                          </div>
                        ) : (
                          <button className="btn btn-ghost btn-sm"><Icon name="eye" size={14} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta && (
              <Pagination page={page} totalPages={meta.total_pages} total={meta.total}
                perPage={meta.per_page} onPage={setPage} />
            )}
          </>
        )}
      </div>

      {showModal && (
        <Modal title="New Leave Request" onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" form="leave-form" type="submit" disabled={creating}>
                {creating ? 'Submitting…' : 'Submit Request'}
              </button>
            </>
          }
        >
          {createError && (
            <div style={{ background: 'var(--red-pale)', color: 'var(--red)', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: 13 }}>
              {createError}
            </div>
          )}
          <form id="leave-form" onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Employee</label>
              <select className="form-input form-select" value={newForm.employee_id}
                onChange={setField('employee_id')} required>
                <option value="">Select employee…</option>
                {(employees ?? []).map((e) => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={newForm.start_date}
                  onChange={setField('start_date')} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={newForm.end_date}
                  onChange={setField('end_date')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <input className="form-input" value={newForm.reason}
                onChange={setField('reason')} placeholder="e.g. Annual leave" required />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
