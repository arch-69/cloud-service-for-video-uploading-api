export default function StatCard({ label, value, hint, trend }) {
  return (
    <div className="card stat-card">
      <div className="stat-header">
        <p className="muted">{label}</p>
        {trend && <span className={`trend ${trend.type}`}>{trend.text}</span>}
      </div>
      <h3>{value}</h3>
      {hint && <p className="muted small">{hint}</p>}
    </div>
  );
}
