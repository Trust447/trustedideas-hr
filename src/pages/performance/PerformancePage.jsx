// src/pages/performance/PerformancePage.jsx
import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi.js';
import { useToast } from '../../hooks/useToast.jsx';
import { performanceApi, employeesApi } from '../../services/api.js';
import Icon from '../../components/ui/Icon.jsx';
import Stars from '../../components/ui/Stars.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { ErrorBanner } from '../../components/ui/ErrorDisplay.jsx';

export default function PerformancePage() {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee_id: '', rating: '4', review_date: new Date().toISOString().split('T')[0], notes: '' });

  const { data: reviews, meta, loading, error, page, setPage, refetch } = useApi(performanceApi.list, {});
  const { data: employees } = useApi(employeesApi.list, { per_page: 100, status: 'active' });

  const avg      = reviews?.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';
  const topCount = reviews?.filter((r) => r.rating >= 4).length ?? 0;
  const attnCount= reviews?.filter((r) => r.rating <= 3).length ?? 0;

  const { mutate: submitReview, loading: submitting, error: submitError } = useMutation(
    performanceApi.create,
    {
      onSuccess: () => { toast.success('Review submitted'); setShowModal(false); refetch(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await submitReview({ ...form, rating: parseInt(form.rating, 10) }); }
    catch { /* handled */ }
  };

  return (
    <div className="page fade-in">
      <div className="page-header page-header-row">
        <div>
          <h1>Performance Reviews</h1>
          <p>{meta ? `${meta.total} reviews` : 'Loading…'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={15} /> New Review
        </button>
      </div>

      <ErrorBanner error={error} onRetry={refetch} />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <StatCard label="Reviews"         value={meta ? String(meta.total) : '—'} color="blue"   icon="📋" />
        <StatCard label="Avg Rating"       value={avg !== '—' ? `${avg}/5` : '—'}  color="accent" icon="⭐" />
        <StatCard label="Top Performers"   value={String(topCount)}                 color="green"  icon="🏆" />
        <StatCard label="Needs Attention"  value={String(attnCount)}                color="amber"  icon="⚠️" />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <SkeletonTable rows={6} cols={5} /> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Employee</th><th>Reviewer</th><th>Rating</th><th>Notes</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {(reviews ?? []).map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar firstName={r.employee_name?.split(' ')[0]} lastName={r.employee_name?.split(' ')[1]} />
                          <span className="td-name">{r.employee_name}</span>
                        </div>
                      </td>
                      <td className="td-muted">{r.reviewer_name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Stars rating={r.rating} />
                          <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{r.rating}/5</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 240 }}>
                        <span style={{ color: 'var(--ink-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                          {r.notes}
                        </span>
                      </td>
                      <td className="td-muted" style={{ fontSize: 12 }}>{r.review_date}</td>
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
        <Modal title="New Performance Review" onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" form="review-form" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </>
          }
        >
          {submitError && (
            <div style={{ background: 'var(--red-pale)', color: 'var(--red)', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: 13 }}>
              {submitError}
            </div>
          )}
          <form id="review-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Employee being reviewed</label>
              <select className="form-input form-select" value={form.employee_id}
                onChange={set('employee_id')} required>
                <option value="">Select employee…</option>
                {(employees ?? []).map((e) => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rating (1–5)</label>
                <input className="form-input" type="number" min="1" max="5"
                  value={form.rating} onChange={set('rating')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Review Date</label>
                <input className="form-input" type="date" value={form.review_date}
                  onChange={set('review_date')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={4} value={form.notes}
                onChange={set('notes')} placeholder="Performance notes…" style={{ resize: 'vertical' }} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
