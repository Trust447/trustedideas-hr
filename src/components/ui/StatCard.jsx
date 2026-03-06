// src/components/ui/StatCard.jsx
export default function StatCard({ label, value, sub, icon, color = 'blue' }) {
  return (
    <div className={`stat-card ${color}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-label">{label}</div>
      <div className="stat-value sm">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
