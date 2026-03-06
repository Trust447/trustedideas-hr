// src/pages/employees/EmployeeModal.jsx
import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { useMutation } from '../../hooks/useApi.js';
import { employeesApi } from '../../services/api.js';

export default function EmployeeModal({ employee, departments, onClose, onSaved }) {
  const isEdit = Boolean(employee);
  const [form, setForm] = useState({
    first_name:    employee?.first_name    ?? '',
    last_name:     employee?.last_name     ?? '',
    email:         employee?.email         ?? '',
    position:      employee?.position      ?? '',
    department_id: employee?.department_id ?? departments[0]?.id ?? '',
    phone:         employee?.phone         ?? '',
    hire_date:     employee?.hire_date     ?? new Date().toISOString().split('T')[0],
  });

  const { mutate, loading, error } = useMutation(
    isEdit ? (data) => employeesApi.update(employee.id, data) : employeesApi.create,
    { onSuccess: () => onSaved() }
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await mutate(form); } catch { /* shown via error state */ }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Employee' : 'Add Employee'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="emp-form" type="submit" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Employee'}
          </button>
        </>
      }
    >
      {error && (
        <div style={{ background: 'var(--red-pale)', color: 'var(--red)', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: 13 }}>
          {error}
        </div>
      )}
      <form id="emp-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-input" value={form.first_name} onChange={set('first_name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-input" value={form.last_name} onChange={set('last_name')} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Position</label>
            <input className="form-input" value={form.position} onChange={set('position')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-input form-select" value={form.department_id} onChange={set('department_id')}>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <label className="form-label">Hire Date</label>
            <input className="form-input" type="date" value={form.hire_date} onChange={set('hire_date')} required />
          </div>
        </div>
      </form>
    </Modal>
  );
}
