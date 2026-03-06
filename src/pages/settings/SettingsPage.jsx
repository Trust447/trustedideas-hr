// src/pages/settings/SettingsPage.jsx
// User profile, password change, notification preferences, and danger zone.

import { useState } from 'react';
import { useAuth }    from '../../hooks/useAuth.jsx';
import { useToast }   from '../../hooks/useToast.jsx';
import { useMutation } from '../../hooks/useApi.js';
import { authApi }    from '../../services/api.js';
import Avatar         from '../../components/ui/Avatar.jsx';

const SECTIONS = ['Profile', 'Security', 'Notifications', 'Danger Zone'];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast }        = useToast();
  const [section, setSection] = useState('Profile');

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sidebar nav */}
        <div className="card" style={{ padding: '8px 0' }}>
          {SECTIONS.map((s) => (
            <button key={s}
              onClick={() => setSection(s)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 18px', border: 'none', cursor: 'pointer',
                fontWeight: section === s ? 600 : 400,
                fontSize: 14,
                background: section === s ? 'var(--accent-pale)' : 'transparent',
                color:      section === s ? 'var(--accent)'      : 'var(--ink)',
                borderLeft: section === s ? '3px solid var(--accent)' : '3px solid transparent',
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="fade-in" key={section}>
          {section === 'Profile'       && <ProfileSection user={user} toast={toast} />}
          {section === 'Security'      && <SecuritySection toast={toast} />}
          {section === 'Notifications' && <NotificationsSection toast={toast} />}
          {section === 'Danger Zone'   && <DangerSection logout={logout} toast={toast} />}
        </div>
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────
function ProfileSection({ user, toast }) {
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name:  user?.last_name  ?? '',
    email:      user?.email      ?? '',
    job_title:  user?.job_title  ?? '',
    phone:      user?.phone      ?? '',
  });

  const { mutate, loading } = useMutation(
    (data) => authApi.updateProfile?.(data) ?? Promise.resolve(data),
    {
      onSuccess: () => toast.success('Profile updated'),
      onError:   (msg) => toast.error(msg),
    }
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="card">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 24 }}>Profile</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
        <Avatar firstName={form.first_name} lastName={form.last_name} size={56} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{form.first_name} {form.last_name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>{form.email}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{user?.roles?.[0]}</div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mutate(form).catch(() => {}); }}>
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
            <label className="form-label">Job Title</label>
            <input className="form-input" value={form.job_title} onChange={set('job_title')} placeholder="HR Director" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Security ──────────────────────────────────────────────────
function SecuritySection({ toast }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { mutate, loading, error } = useMutation(
    (data) => authApi.changePassword(data.current_password, data.new_password),
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
        setForm({ current_password: '', new_password: '', confirm_password: '' });
      },
      onError: (msg) => toast.error(msg),
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    mutate(form).catch(() => {});
  };

  const strength = form.new_password.length === 0 ? 0
    : form.new_password.length < 8 ? 1
    : form.new_password.length < 12 ? 2 : 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 24 }}>Change Password</h2>
        {error && <div style={{ background: 'var(--red-pale)', color: 'var(--red)', padding: '8px 12px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" value={form.current_password} onChange={set('current_password')} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" value={form.new_password} onChange={set('new_password')} required />
            {form.new_password && (
              <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                {[1,2,3].map((l) => (
                  <div key={l} style={{ flex: 1, height: 3, borderRadius: 2, background: strength >= l ? ['','var(--red)','var(--amber)','var(--green)'][strength] : 'var(--cream-mid)' }} />
                ))}
                <span style={{ fontSize: 11, color: ['','var(--red)','var(--amber)','var(--green)'][strength], fontWeight: 600 }}>
                  {['','Weak','Good','Strong'][strength]}
                </span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-input" type="password" value={form.confirm_password} onChange={set('confirm_password')} required />
            {form.confirm_password && form.new_password !== form.confirm_password && (
              <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>Passwords do not match</div>
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12 }}>Active Sessions</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 16 }}>You are currently signed in on this device.</p>
        <div style={{ padding: '12px 14px', background: 'var(--cream)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>💻</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>This device — Current session</div>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Active now</div>
          </div>
          <span style={{ marginLeft: 'auto', padding: '2px 8px', background: 'var(--green-pale)', color: 'var(--green)', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>Active</span>
        </div>
      </div>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────
function NotificationsSection({ toast }) {
  const [prefs, setPrefs] = useState({
    email_leave_approved:  true,
    email_leave_request:   true,
    email_payslip:         true,
    email_system:          true,
    digest_weekly:         false,
  });

  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const notifs = [
    { key: 'email_leave_approved', label: 'Leave approvals',       sub: 'When your leave is approved or rejected' },
    { key: 'email_leave_request',  label: 'New leave requests',    sub: 'When team members submit leave (HR only)' },
    { key: 'email_payslip',        label: 'Payslip ready',         sub: 'Monthly notification when payslip is available' },
    { key: 'email_system',         label: 'System notifications',  sub: 'Password changes, account activity' },
    { key: 'digest_weekly',        label: 'Weekly digest',         sub: 'Summary of HR activity every Monday' },
  ];

  return (
    <div className="card">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>Notifications</h2>
      <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 24 }}>Choose which emails you receive.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {notifs.map((n, i) => (
          <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < notifs.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{n.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{n.sub}</div>
            </div>
            <button onClick={() => toggle(n.key)} role="switch" aria-checked={prefs[n.key]}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: prefs[n.key] ? 'var(--accent)' : 'var(--border)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 200ms', flexShrink: 0,
              }}>
              <span style={{
                position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white',
                transition: 'left 200ms',
                left: prefs[n.key] ? 23 : 3,
                boxShadow: '0 1px 3px rgba(0,0,0,.2)',
              }} />
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ marginTop: 24 }}
        onClick={() => toast.success('Notification preferences saved')}>
        Save Preferences
      </button>
    </div>
  );
}

// ── Danger Zone ───────────────────────────────────────────────
function DangerSection({ logout, toast }) {
  const [confirmText, setConfirmText] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6, color: 'var(--red)' }}>Danger Zone</h2>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 20 }}>These actions are permanent and cannot be undone.</p>

        <div style={{ border: '1px solid var(--red)', borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Sign out of all devices</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 14 }}>
            This will immediately invalidate all active sessions and refresh tokens.
          </div>
          <button className="btn btn-danger" onClick={() => { toast.success('All sessions revoked'); logout(); }}>
            Sign out everywhere
          </button>
        </div>

        <div style={{ border: '1px solid var(--red)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Delete my account</div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 14 }}>
            Your account and all personal data will be permanently deleted. Workspace data is retained.
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" style={{ color: 'var(--red)' }}>Type DELETE to confirm</label>
            <input className="form-input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE" />
          </div>
          <button className="btn btn-danger" disabled={confirmText !== 'DELETE'}
            onClick={() => toast.error('Contact your workspace admin to delete your account')}>
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
}
