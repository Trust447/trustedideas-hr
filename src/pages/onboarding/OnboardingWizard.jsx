// src/pages/onboarding/OnboardingWizard.jsx
// 5-step tenant provisioning wizard:
//   1. Company Details  2. Admin Account  3. Departments  4. Invite Team  5. Billing & Plan
//
// On completion: calls POST /tenants/onboard (single atomic endpoint)
// that provisions schema, runs migrations, seeds roles, and queues welcome emails.

import { useState, useCallback } from 'react';
import { useMutation } from '../../hooks/useApi.js';
import { useToast } from '../../hooks/useToast.jsx';

// ─── API call ────────────────────────────────────────────────
const tenantsApi = {
  onboard: (data) =>
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/tenants/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};

// ─── Constants ───────────────────────────────────────────────
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance & Banking', 'Education',
  'Retail & E-commerce', 'Manufacturing', 'Media & Entertainment',
  'Professional Services', 'Non-profit', 'Other',
];

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '501–1000', '1000+'];

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 0, period: 'Free forever',
    color: 'var(--border)', accent: 'var(--ink-muted)',
    features: ['Up to 10 employees', 'Core HR modules', 'Email support', '1 admin user'],
  },
  {
    id: 'growth', name: 'Growth', price: 29, period: '/month per 10 employees',
    color: 'var(--accent)', accent: 'var(--accent)', popular: true,
    features: ['Up to 200 employees', 'All HR modules', 'Payroll processing', 'Priority support', '5 admin users', 'PDF reports'],
  },
  {
    id: 'enterprise', name: 'Enterprise', price: null, period: 'Custom pricing',
    color: 'var(--ink)', accent: 'var(--ink)',
    features: ['Unlimited employees', 'Custom integrations', 'SSO / SAML', 'Dedicated CSM', 'SLA guarantee', 'On-premise option'],
  },
];

const DEFAULT_DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Finance', 'HR', 'Sales'];

const STEPS = [
  { id: 'company',     label: 'Company',     icon: '🏢' },
  { id: 'admin',       label: 'Admin',        icon: '👤' },
  { id: 'departments', label: 'Departments',  icon: '🏗' },
  { id: 'invite',      label: 'Invite',       icon: '✉️' },
  { id: 'billing',     label: 'Billing',      icon: '💳' },
];

// ─── Step components ─────────────────────────────────────────

function StepCompany({ data, onChange }) {
  const set = (k) => (e) => onChange({ ...data, [k]: e.target.value });
  return (
    <div>
      <h2 style={S.stepTitle}>Tell us about your company</h2>
      <p style={S.stepSub}>This sets up your dedicated HR workspace.</p>
      <div style={S.formGrid}>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Company Name *</label>
          <input className="form-input" value={data.company_name} onChange={set('company_name')}
            placeholder="Acme Corp" required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Workspace Domain *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <input className="form-input" value={data.subdomain} onChange={set('subdomain')}
              placeholder="acme" style={{ borderRadius: '6px 0 0 6px', borderRight: 'none' }}
              pattern="[a-z0-9-]+" title="Lowercase letters, numbers, and hyphens only" required />
            <span style={{ padding: '9px 12px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: '0 6px 6px 0', fontSize: 13, color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
              .trustedideas.com
            </span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Company Size</label>
          <select className="form-input form-select" value={data.size} onChange={set('size')}>
            {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Industry</label>
          <select className="form-input form-select" value={data.industry} onChange={set('industry')}>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Website <span style={{ color: 'var(--ink-light)', fontWeight: 400 }}>(optional)</span></label>
          <input className="form-input" value={data.website} onChange={set('website')}
            placeholder="https://acmecorp.com" type="url" />
        </div>
      </div>

      {/* Live preview */}
      {data.company_name && (
        <div style={{ marginTop: 24, padding: '14px 18px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            {data.company_name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{data.company_name}</div>
            {data.subdomain && (
              <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                {data.subdomain}.trustedideas.com
              </div>
            )}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-muted)' }}>{data.size} · {data.industry}</div>
        </div>
      )}
    </div>
  );
}

function StepAdmin({ data, onChange }) {
  const set = (k) => (e) => onChange({ ...data, [k]: e.target.value });
  const [showPass, setShowPass] = useState(false);
  const strength = data.password.length === 0 ? 0
    : data.password.length < 8 ? 1
    : data.password.length < 12 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'var(--red)', 'var(--amber)', 'var(--green)'];

  return (
    <div>
      <h2 style={S.stepTitle}>Create your admin account</h2>
      <p style={S.stepSub}>This will be the primary administrator for your workspace.</p>
      <div style={S.formGrid}>
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input className="form-input" value={data.first_name} onChange={set('first_name')} placeholder="Sarah" required />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name *</label>
          <input className="form-input" value={data.last_name} onChange={set('last_name')} placeholder="Chen" required />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Work Email *</label>
          <input className="form-input" type="email" value={data.email} onChange={set('email')}
            placeholder="sarah@acmecorp.com" required />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2', position: 'relative' }}>
          <label className="form-label">Password *</label>
          <input className="form-input" type={showPass ? 'text' : 'password'} value={data.password}
            onChange={set('password')} placeholder="Min 8 characters" style={{ paddingRight: 44 }} required />
          <button type="button" onClick={() => setShowPass((p) => !p)}
            style={{ position: 'absolute', right: 10, bottom: 9, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 13 }}>
            {showPass ? 'Hide' : 'Show'}
          </button>
          {data.password && (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              {[1,2,3].map((lvl) => (
                <div key={lvl} style={{ flex: 1, height: 4, borderRadius: 2, background: strength >= lvl ? strengthColor[strength] : 'var(--cream-mid)', transition: 'background 300ms' }} />
              ))}
              <span style={{ fontSize: 11, color: strengthColor[strength], fontWeight: 600 }}>{strengthLabel[strength]}</span>
            </div>
          )}
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Job Title <span style={{ color: 'var(--ink-light)', fontWeight: 400 }}>(optional)</span></label>
          <input className="form-input" value={data.job_title} onChange={set('job_title')} placeholder="HR Director" />
        </div>
      </div>
    </div>
  );
}

function StepDepartments({ data, onChange }) {
  const [input, setInput] = useState('');
  const depts = data.departments ?? [];

  const add = () => {
    const name = input.trim();
    if (!name || depts.includes(name)) return;
    onChange({ ...data, departments: [...depts, name] });
    setInput('');
  };

  const remove = (d) => onChange({ ...data, departments: depts.filter((x) => x !== d) });

  const loadDefaults = () => onChange({ ...data, departments: [...DEFAULT_DEPARTMENTS] });

  return (
    <div>
      <h2 style={S.stepTitle}>Set up your departments</h2>
      <p style={S.stepSub}>Create your initial organisational structure. You can always add more later.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input className="form-input" value={input} placeholder="Department name…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          style={{ flex: 1 }} />
        <button type="button" className="btn btn-primary" onClick={add} disabled={!input.trim()}>
          Add
        </button>
      </div>

      {depts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px', border: '2px dashed var(--border)', borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏗</div>
          <p style={{ color: 'var(--ink-muted)', fontSize: 13, marginBottom: 12 }}>No departments yet</p>
          <button type="button" className="btn btn-secondary" onClick={loadDefaults}>
            Load common defaults
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {depts.map((d) => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px 6px 14px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 20, fontSize: 13 }}>
              {d}
              <button type="button" onClick={() => remove(d)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-light)', fontSize: 16, lineHeight: 1, padding: 0 }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {depts.length > 0 && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={loadDefaults}
          style={{ marginTop: 4 }}>
          Reset to defaults
        </button>
      )}

      <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--blue-pale)', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 12, color: 'var(--blue)' }}>
        ℹ Each department will have its own manager, headcount tracking, and reporting dashboard.
      </div>
    </div>
  );
}

function StepInvite({ data, onChange }) {
  const [emailInput, setEmailInput] = useState('');
  const [roleInput,  setRoleInput]  = useState('Employee');
  const invites = data.invites ?? [];

  const add = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes('@') || invites.find((i) => i.email === email)) return;
    onChange({ ...data, invites: [...invites, { email, role: roleInput }] });
    setEmailInput('');
  };

  const remove = (email) => onChange({ ...data, invites: invites.filter((i) => i.email !== email) });

  const updateRole = (email, role) =>
    onChange({ ...data, invites: invites.map((i) => i.email === email ? { ...i, role } : i) });

  return (
    <div>
      <h2 style={S.stepTitle}>Invite your team</h2>
      <p style={S.stepSub}>They'll receive a welcome email with login instructions. You can skip this and invite later.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="form-input" type="email" value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="colleague@company.com" style={{ flex: 1, minWidth: 200 }} />
        <select className="form-input form-select" value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)} style={{ width: 'auto' }}>
          {['Admin', 'HR Manager', 'Finance Lead', 'Employee'].map((r) => <option key={r}>{r}</option>)}
        </select>
        <button type="button" className="btn btn-primary" onClick={add} disabled={!emailInput.trim()}>
          Add
        </button>
      </div>

      {invites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px', border: '2px dashed var(--border)', borderRadius: 10, color: 'var(--ink-muted)', fontSize: 13 }}>
          ✉️ No invites added yet — you can always invite from the Employees page
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {invites.map((inv) => (
            <div key={inv.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0 }}>
                {inv.email[0].toUpperCase()}
              </div>
              <span style={{ flex: 1, fontSize: 13 }}>{inv.email}</span>
              <select className="form-input form-select" value={inv.role}
                onChange={(e) => updateRole(inv.email, e.target.value)}
                style={{ width: 'auto', fontSize: 12, padding: '5px 28px 5px 8px' }}>
                {['Admin', 'HR Manager', 'Finance Lead', 'Employee'].map((r) => <option key={r}>{r}</option>)}
              </select>
              <button type="button" onClick={() => remove(inv.email)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-light)', fontSize: 18, padding: 0 }}>
                ×
              </button>
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', padding: '4px 0' }}>
            {invites.length} invite{invites.length !== 1 ? 's' : ''} queued
          </div>
        </div>
      )}
    </div>
  );
}

function StepBilling({ data, onChange }) {
  return (
    <div>
      <h2 style={S.stepTitle}>Choose your plan</h2>
      <p style={S.stepSub}>Start free and upgrade as your team grows. No credit card needed for Starter.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {PLANS.map((plan) => {
          const selected = data.plan === plan.id;
          return (
            <div key={plan.id}
              onClick={() => onChange({ ...data, plan: plan.id })}
              role="radio" aria-checked={selected} tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onChange({ ...data, plan: plan.id })}
              style={{
                padding: '18px 20px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${selected ? plan.color : 'var(--border)'}`,
                background: selected ? (plan.id === 'growth' ? 'var(--accent-pale)' : 'var(--cream)') : 'white',
                transition: 'all 200ms', position: 'relative',
              }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -10, left: 20, background: 'var(--accent)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 10, letterSpacing: '0.05em' }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: plan.accent }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{plan.period}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {plan.price === null
                    ? <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)' }}>Custom</div>
                    : <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: plan.accent }}>
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      </div>
                  }
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {plan.features.map((f) => (
                  <span key={f} style={{ fontSize: 11, padding: '3px 8px', background: 'white', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--ink-muted)' }}>
                    ✓ {f}
                  </span>
                ))}
              </div>
              {selected && (
                <div style={{ position: 'absolute', top: 18, right: 20, width: 22, height: 22, borderRadius: '50%', background: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 14px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--ink-muted)' }}>
        🔒 Secure checkout · Cancel anytime · 30-day money-back guarantee
      </div>
    </div>
  );
}

function CompletionScreen({ companyName, onEnter }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 12 }}>
        You're all set!
      </h2>
      <p style={{ color: 'var(--ink-muted)', fontSize: 15, maxWidth: 380, margin: '0 auto 32px' }}>
        <strong>{companyName}</strong>'s HR workspace is being provisioned. This takes about 30 seconds.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto 32px' }}>
        {[
          ['✓', 'Workspace created',          'green'],
          ['✓', 'Database schema provisioned', 'green'],
          ['✓', 'Roles & permissions seeded',  'green'],
          ['⟳', 'Sending invite emails…',       'amber'],
        ].map(([icon, label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'white', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'left' }}>
            <span style={{ color: `var(--${color})`, fontWeight: 700, width: 18, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13 }}>{label}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{ padding: '11px 28px', fontSize: 15 }} onClick={onEnter}>
        Enter your workspace →
      </button>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────
const S = {
  stepTitle: { fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 },
  stepSub:   { color: 'var(--ink-muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 },
  formGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' },
};

// ─── Main Wizard ──────────────────────────────────────────────
export default function OnboardingWizard({ onComplete }) {
  const { toast } = useToast();
  const [step,      setStep]      = useState(0);
  const [done,      setDone]      = useState(false);
  const [formData,  setFormData]  = useState({
    // Step 1 — Company
    company_name: '', subdomain: '', size: '11–50', industry: 'Technology', website: '',
    // Step 2 — Admin
    first_name: '', last_name: '', email: '', password: '', job_title: '',
    // Step 3 — Departments
    departments: [],
    // Step 4 — Invites
    invites: [],
    // Step 5 — Billing
    plan: 'growth',
  });

  const { mutate: submitOnboarding, loading: submitting } = useMutation(
    tenantsApi.onboard,
    {
      onSuccess: () => setDone(true),
      onError:   (msg) => toast.error(`Setup failed: ${msg}`),
    }
  );

  const totalSteps = STEPS.length;

  const validate = () => {
    if (step === 0) {
      if (!formData.company_name.trim()) return 'Company name is required';
      if (!formData.subdomain.trim())    return 'Workspace domain is required';
      if (!/^[a-z0-9-]+$/.test(formData.subdomain)) return 'Domain may only contain lowercase letters, numbers, and hyphens';
    }
    if (step === 1) {
      if (!formData.first_name.trim()) return 'First name is required';
      if (!formData.last_name.trim())  return 'Last name is required';
      if (!formData.email.trim())      return 'Email is required';
      if (formData.password.length < 8) return 'Password must be at least 8 characters';
    }
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    try { await submitOnboarding(formData); }
    catch { /* handled in onError */ }
  };

  if (done) {
    return (
      <div style={wizardWrap}>
        <div style={wizardCard}>
          <CompletionScreen companyName={formData.company_name} onEnter={onComplete} />
        </div>
      </div>
    );
  }

  const stepComponents = [
    <StepCompany      key="company"     data={formData} onChange={setFormData} />,
    <StepAdmin        key="admin"       data={formData} onChange={setFormData} />,
    <StepDepartments  key="departments" data={formData} onChange={setFormData} />,
    <StepInvite       key="invite"      data={formData} onChange={setFormData} />,
    <StepBilling      key="billing"     data={formData} onChange={setFormData} />,
  ];

  const pct = ((step + 1) / totalSteps) * 100;

  return (
    <div style={wizardWrap}>
      <div style={wizardCard}>
        {/* Header */}
        <div style={{ padding: '28px 32px 0', borderBottom: '1px solid var(--border)', paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🏢</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>Trusted Ideas HR</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-muted)' }}>Step {step + 1} of {totalSteps}</span>
          </div>

          {/* Step pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((s, i) => {
              const state = i < step ? 'done' : i === step ? 'active' : 'pending';
              return (
                <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: state === 'done' ? 'var(--green)' : state === 'active' ? 'var(--accent)' : 'var(--cream-dark)',
                    color: state === 'pending' ? 'var(--ink-muted)' : 'white',
                    fontWeight: state === 'active' ? 700 : 400,
                    transition: 'all 200ms',
                    cursor: i < step ? 'pointer' : 'default',
                  }} onClick={() => i < step && setStep(i)}>
                    {state === 'done' ? '✓' : s.icon}
                  </div>
                  <span style={{ fontSize: 10, color: state === 'active' ? 'var(--accent)' : 'var(--ink-muted)', fontWeight: state === 'active' ? 600 : 400 }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 16 }}>
            <div className="progress" style={{ height: 4 }}>
              <div className="progress-bar" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
            </div>
          </div>
        </div>

        {/* Step content */}
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {stepComponents[step]}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            ← Back
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            {step === 3 && (
              <button className="btn btn-ghost" onClick={() => setStep((s) => s + 1)}>
                Skip for now
              </button>
            )}
            <button className="btn btn-primary" onClick={next} disabled={submitting}
              style={{ minWidth: 120 }}>
              {submitting ? 'Setting up…' : step === totalSteps - 1 ? 'Launch workspace 🚀' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const wizardWrap = {
  minHeight: '100vh', background: 'var(--cream)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 24,
};
const wizardCard = {
  background: 'white', borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 580,
  display: 'flex', flexDirection: 'column',
  maxHeight: '92vh', overflow: 'hidden',
};
