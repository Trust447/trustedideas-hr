// src/hooks/useToast.jsx
// Lightweight toast system — no external deps.
// Usage: const { toast } = useToast();
//        toast.success('Saved!') / toast.error('Failed') / toast.info('...')

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type, message, duration = 4000) => {
    const id = ++_id;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]); // max 5
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    success: (msg, dur) => add('success', msg, dur),
    error:   (msg, dur) => add('error',   msg, dur ?? 6000),
    info:    (msg, dur) => add('info',    msg, dur),
    warning: (msg, dur) => add('warning', msg, dur),
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
const COLORS = {
  success: { bg: 'var(--green-pale)',  border: 'var(--green)',  text: 'var(--green)'  },
  error:   { bg: 'var(--red-pale)',    border: 'var(--red)',    text: 'var(--red)'    },
  info:    { bg: 'var(--blue-pale)',   border: 'var(--blue)',   text: 'var(--blue)'   },
  warning: { bg: 'var(--amber-pale)',  border: 'var(--amber)',  text: 'var(--amber)'  },
};

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 9999, maxWidth: 360, width: '100%',
    }}>
      {toasts.map((t) => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            boxShadow: 'var(--shadow-md)',
            animation: 'slideUp 200ms ease',
          }}>
            <span style={{ color: c.text, fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>
              {ICONS[t.type]}
            </span>
            <span style={{ flex: 1, fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>{t.message}</span>
            <button onClick={() => onDismiss(t.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-muted)', fontSize: 14, padding: 0,
              flexShrink: 0, marginTop: 1, lineHeight: 1,
            }}>×</button>
          </div>
        );
      })}
    </div>
  );
}
