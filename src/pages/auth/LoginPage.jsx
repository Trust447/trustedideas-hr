// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: 'admin@acme.com', password: 'password123' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try { await login(form.email, form.password); }
    catch { /* error shown via context */ }
  };

  const set = (k) => (e) => { clearError(); setForm((f) => ({ ...f, [k]: e.target.value })); };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo-mark" style={{ marginBottom: 48 }}>
            <div className="logo-icon">🏢</div>
            <span style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)', fontSize: 18 }}>
              Trusted Ideas HR
            </span>
          </div>
          <h1 className="auth-headline">
            People-first<br /><em>HR operations</em><br />at scale.
          </h1>
          <p className="auth-tagline">
            Manage your entire workforce — from onboarding to payroll —
            in one beautifully unified platform.
          </p>
          <div style={{ marginTop: 56, display: 'flex', gap: 40 }}>
            {[['142+','Employees managed'],['99.9%','Platform uptime'],['24/7','Support']].map(([n,l]) => (
              <div key={n}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--cream)' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.4)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-sub">Sign in to your HR workspace</p>

          {error && (
            <div style={{ background: 'var(--red-pale)', color: 'var(--red)', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input id="email" className="form-input" type="email" value={form.email}
                onChange={set('email')} placeholder="you@company.com" required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" className="form-input" type="password" value={form.password}
                onChange={set('password')} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: 'var(--accent)', cursor: 'pointer' }}>Forgot password?</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--ink-light)' }}>
            {import.meta.env.VITE_USE_MOCK === 'true'
              ? 'Demo mode — credentials pre-filled, just click Sign in.'
              : 'Enter your workspace credentials to continue.'}
          </p>
        </div>
      </div>
    </div>
  );
}
