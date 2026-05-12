import { formatDateTime } from "../../utils/format.utils";

export default function ActivityFeed({ activities }) {
  if (!activities.length) {
    return (
      <div className="card empty-state">
        <p className="muted">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="card activity-feed">
      <h3>Recent activity</h3>
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            <div>
              <p>{activity.message}</p>
              <span className="muted small">
                {formatDateTime(activity.timestamp)}
              </span>
            </div>
            <span className={`status-pill ${activity.status || ""}`}>
              {activity.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
