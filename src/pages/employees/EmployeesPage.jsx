// src/pages/employees/EmployeesPage.jsx
import { useState, useCallback } from 'react';
import { useApi, useMutation } from '../../hooks/useApi.js';
import { useToast } from '../../hooks/useToast.jsx';
import { employeesApi, departmentsApi } from '../../services/api.js';
import Icon from '../../components/ui/Icon.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { SkeletonTable } from '../../components/ui/Skeleton.jsx';
import { ErrorBanner } from '../../components/ui/ErrorDisplay.jsx';
import EmployeeModal from './EmployeeModal.jsx';

export default function EmployeesPage() {
  const { toast } = useToast();
  const _initial = window.__globalSearch ?? '';
  if (window.__globalSearch) window.__globalSearch = null;
  const [searchInput, setSearchInput] = useState(_initial);
  const [search, setSearch] = useState(_initial);
  const [deptFilter, setDeptFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: employees, meta, loading, error, page, setPage, refetch } = useApi(
    employeesApi.list,
    { search, department_id: deptFilter === 'all' ? undefined : deptFilter },
    [search, deptFilter]
  );

  const { data: departments } = useApi(departmentsApi.list, {});

  const { mutate: deleteEmployee, loading: deleting } = useMutation(
    (id) => employeesApi.delete(id),
    {
      onSuccess: () => { toast.success('Employee removed'); refetch(); },
      onError: (msg) => toast.error(msg),
    }
  );

  const handleSearch = useCallback(() => { setSearch(searchInput); setPage(1); }, [searchInput, setPage]);

  const handleDelete = async (emp) => {
    if (!window.confirm(`Delete ${emp.first_name} ${emp.last_name}? This cannot be undone.`)) return;
    try { await deleteEmployee(emp.id); } catch { /* handled */ }
  };

  const openAdd = () => { setSelected(null); setModalOpen(true); };
  const openEdit = (e) => { setSelected(e); setModalOpen(true); };

  return (
    <div className="page fade-in">
      <div className="page-header page-header-row">
        <div>
          <h1>Employees</h1>
          <p>{meta ? `${meta.total} total` : loading ? 'Loading…' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Icon name="plus" size={15} /> Add Employee
        </button>
      </div>

      <ErrorBanner error={error} onRetry={refetch} />

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Icon name="search" size={15} className="search-icon" />
          <input className="form-input search-input" placeholder="Search by name, email, role…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleSearch}>Search</button>
        <select className="form-input form-select" style={{ width: 'auto', minWidth: 170 }}
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
          <option value="all">All Departments</option>
          {(departments ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button className="btn btn-secondary"><Icon name="download" size={14} /> Export</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <SkeletonTable rows={8} cols={5} />
          : !employees?.length
            ? <EmptyState icon="🔍" title="No employees found" description="Try adjusting your search or filters." />
            : (
              <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Employee</th><th>Position</th><th>Department</th>
                        <th>Status</th><th>Hire Date</th><th style={{ width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((e) => (
                        <tr key={e.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar firstName={e.first_name} lastName={e.last_name} />
                              <div>
                                <div className="td-name">{e.first_name} {e.last_name}</div>
                                <div className="td-muted" style={{ fontSize: 12 }}>{e.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{e.position}</td>
                          <td>{e.department_name}</td>
                          <td><Badge status={e.status}>{e.status}</Badge></td>
                          <td className="td-muted">{e.hire_date}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>
                                <Icon name="edit" size={14} />
                              </button>
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                                disabled={deleting} onClick={() => handleDelete(e)}>
                                <Icon name="trash" size={14} />
                              </button>
                            </div>
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
            )
        }
      </div>

      {modalOpen && (
        <EmployeeModal
          employee={selected}
          departments={departments ?? []}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refetch(); toast.success(selected ? 'Employee updated' : 'Employee added'); }}
        />
      )}
    </div>
  );
}
