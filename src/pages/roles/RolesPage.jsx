// src/pages/roles/RolesPage.jsx
import { useState } from 'react';
import { useApi, useMutation } from '../../hooks/useApi.js';
import { useToast } from '../../hooks/useToast.jsx';
import { rolesApi } from '../../services/api.js';
import Icon from '../../components/ui/Icon.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { ErrorBanner } from '../../components/ui/ErrorDisplay.jsx';
import { formatPermission } from '../../utils/formatters.js';

export default function RolesPage() {
  const { toast } = useToast();
  const [selected,  setSelected]  = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPerms,  setNewPerms]  = useState([]);
  const [newName,   setNewName]   = useState('');
  const [newDesc,   setNewDesc]   = useState('');

  const { data: roles, loading: rolesLoading, error: rolesError, refetch: refetchRoles } = useApi(rolesApi.list, {});
  const { data: allPermissions, loading: permsLoading } = useApi(rolesApi.permissions, {});

  const permissions = allPermissions ?? [];
  const roleList    = roles ?? [];

  // Select first role once loaded
  if (roleList.length > 0 && !selected) setSelected(roleList[0]);

  const { mutate: createRole, loading: creating, error: createError } = useMutation(
    (data) => rolesApi.create(data),
    {
      onSuccess: (newRole) => {
        toast.success(`Role "${newRole.name}" created`);
        setShowModal(false);
        setNewName(''); setNewDesc(''); setNewPerms([]);
        refetchRoles();
      },
      onError: (msg) => toast.error(msg),
    }
  );

  const { mutate: deleteRole } = useMutation(
    (id) => rolesApi.delete(id),
    {
      onSuccess: () => { toast.success('Role deleted'); setSelected(null); refetchRoles(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  const togglePerm = (p) =>
    setNewPerms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createRole({ name: newName, description: newDesc, permissions: newPerms }); }
    catch { /* handled */ }
  };

  const handleDelete = async (role) => {
    if (role.name === 'Admin') { toast.error('Cannot delete the Admin role'); return; }
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try { await deleteRole(role.id); } catch { /* handled */ }
  };

  return (
    <div className="page fade-in">
      <div className="page-header page-header-row">
        <div>
          <h1>Roles & Permissions</h1>
          <p>Manage access control across your organisation</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setNewName(''); setNewDesc(''); setNewPerms([]); setShowModal(true); }}>
          <Icon name="plus" size={15} /> New Role
        </button>
      </div>

      <ErrorBanner error={rolesError} onRetry={refetchRoles} />

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Role list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rolesLoading
            ? [1,2,3].map((i) => <SkeletonCard key={i} lines={2} />)
            : roleList.map((r) => {
              const isActive = selected?.id === r.id;
              return (
                <div key={r.id} className="card hoverable"
                  style={{ padding: '16px 20px', borderColor: isActive ? 'var(--accent)' : 'var(--border)', background: isActive ? 'var(--accent-pale)' : 'white' }}
                  onClick={() => setSelected(r)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: isActive ? 'var(--accent)' : 'var(--ink)' }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 3 }}>{r.description}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Badge status="role">{r.permissions?.length ?? 0} perms</Badge>
                      {r.name !== 'Admin' && (
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', padding: '4px 6px' }}
                          onClick={(e) => { e.stopPropagation(); handleDelete(r); }}>
                          <Icon name="trash" size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Permission detail panel */}
        {selected && !rolesLoading && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{selected.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{selected.description}</p>
              </div>
              <button className="btn btn-secondary btn-sm"><Icon name="edit" size={13} /> Edit</button>
            </div>
            <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Permissions
            </div>
            {permsLoading
              ? <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Loading permissions…</p>
              : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {permissions.map((p) => {
                    const granted = selected.permissions?.includes(p);
                    return (
                      <div key={p} style={{
                        padding: '5px 10px', borderRadius: 5,
                        fontSize: 12, fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 5,
                        background:   granted ? 'var(--accent-pale)' : 'var(--cream)',
                        color:        granted ? 'var(--accent)'      : 'var(--ink-light)',
                        border: `1px solid ${granted ? 'var(--accent-light)' : 'var(--border)'}`,
                      }}>
                        {granted && <Icon name="check" size={11} />}
                        {formatPermission(p)}
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Create Role" onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" form="role-form" type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create Role'}
              </button>
            </>
          }
        >
          {createError && (
            <div style={{ background: 'var(--red-pale)', color: 'var(--red)', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: 13 }}>
              {createError}
            </div>
          )}
          <form id="role-form" onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Role Name</label>
              <input className="form-input" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Finance Manager" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe this role's responsibilities" />
            </div>
            <div className="form-group">
              <label className="form-label">Permissions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {permissions.map((p) => (
                  <label key={p} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, cursor: 'pointer', padding: '5px 10px',
                    border: `1px solid ${newPerms.includes(p) ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 5,
                    background: newPerms.includes(p) ? 'var(--accent-pale)' : 'var(--cream)',
                    color: newPerms.includes(p) ? 'var(--accent)' : 'var(--ink)',
                    transition: 'all 150ms ease',
                  }}>
                    <input type="checkbox" checked={newPerms.includes(p)} onChange={() => togglePerm(p)}
                      style={{ accentColor: 'var(--accent)' }} />
                    {formatPermission(p)}
                  </label>
                ))}
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
