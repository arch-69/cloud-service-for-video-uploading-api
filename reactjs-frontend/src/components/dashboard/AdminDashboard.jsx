import StatCard from "../shared/StatCard";
import ActivityFeed from "../shared/ActivityFeed";
import UploadList from "../upload/UploadList";
import { formatBytes } from "../../utils/format.utils";

export default function AdminDashboard({ records, activities, users }) {
  const totalUploads = records.length;
  const completed = records.filter(
    (record) => record.status === "COMPLETED"
  );
  const totalTraffic = records.reduce(
    (sum, record) => sum + (record.fileSize || 0),
    0
  );

  const successRate = totalUploads
    ? Math.round((completed.length / totalUploads) * 100)
    : 0;

  return (
    <div className="dashboard-grid">
      <div className="stat-grid">
        <StatCard
          label="Active users"
          value={users.length}
          hint="All accounts"
          trend={{ type: "positive", text: "+4" }}
        />
        <StatCard
          label="Total uploads"
          value={totalUploads}
          hint={`Success rate ${successRate}%`}
        />
        <StatCard
          label="Traffic volume"
          value={formatBytes(totalTraffic)}
          hint="Last 7 days"
        />
      </div>

      <div className="card insights">
        <h3>Traffic insights</h3>
        <p className="muted">
          Peak usage today between 1pm - 4pm. Average upload time
          12s, median chunk size 5MB.
        </p>
        <div className="insight-grid">
          <div>
            <p className="muted small">Latency</p>
            <strong>120ms</strong>
          </div>
          <div>
            <p className="muted small">Failure rate</p>
            <strong>2.1%</strong>
          </div>
          <div>
            <p className="muted small">Encrypted objects</p>
            <strong>100%</strong>
          </div>
        </div>
      </div>

      <UploadList records={records} title="All uploads" />
      <ActivityFeed activities={activities} />
    </div>
  );
}
