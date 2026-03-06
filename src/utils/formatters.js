// src/utils/formatters.js — all amounts in Naira

export function formatCurrency(value, compact = false) {
  if (value == null || isNaN(value)) return '₦0';
  const n = Number(value);
  if (compact) {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}k`;
    return `₦${n}`;
  }
  return '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    year:'numeric', month:'short', day:'numeric', ...opts,
  });
}

export function formatTime(isoStr) {
  if (!isoStr) return '—';
  // Handle both full ISO strings and bare time strings like "09:00"
  const d = isoStr.includes('T') ? new Date(isoStr) : new Date(`1970-01-01T${isoStr}`);
  return d.toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit', hour12:true });
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleString('en-NG', {
    month:'short', day:'numeric', hour:'2-digit', minute:'2-digit',
  });
}

export function getInitials(firstName = '', lastName = '') {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatPermission(key = '') {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function pluralize(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}
