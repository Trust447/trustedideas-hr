// src/components/ui/Badge.jsx
export default function Badge({ status, children, className = '' }) {
  return <span className={`badge ${status ?? ''} ${className}`}>{children}</span>;
}
