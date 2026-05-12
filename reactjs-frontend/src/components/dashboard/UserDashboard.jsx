import StatCard from "../shared/StatCard";
import UploadPanel from "../upload/UploadPanel";
import UploadList from "../upload/UploadList";
import { formatBytes } from "../../utils/format.utils";

export default function UserDashboard({
  records,
  currentUpload,
  uploadControls,
  isLoading,
  onRefresh,
}) {
  const completed = records.filter(
    (record) => record.status === "COMPLETED"
  );
  const partial = records.filter(
    (record) => record.status === "PARTIAL"
  );
  const totalSize = completed.reduce(
    (sum, record) => sum + (record.fileSize || 0),
    0
  );

  return (
    <div className="dashboard-grid">
      <div className="stat-grid">
        <StatCard
          label="Successful uploads"
          value={completed.length}
          hint="Last 30 days"
          trend={{ type: "positive", text: "+12%" }}
        />
        <StatCard
          label="Partial uploads"
          value={partial.length}
          hint="Needs attention"
          trend={{ type: "warning", text: "-" }}
        />
        <StatCard
          label="Total data moved"
          value={formatBytes(totalSize)}
          hint="Compressed & encrypted"
        />
      </div>

      <UploadPanel {...uploadControls} currentUpload={currentUpload} />

      <div className="card dashboard-header">
        <div>
          <h3>Upload activity</h3>
          <p className="muted small">
            Synced from your profile history.
          </p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <UploadList records={records} title="Your uploads" />

    </div>
  );
}
