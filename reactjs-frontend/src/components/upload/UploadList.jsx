import { formatBytes, formatDateTime } from "../../utils/format.utils";

export default function UploadList({ records, title }) {
  return (
    <div className="card upload-list">
      <div className="upload-list__header">
        <h3>{title}</h3>
        <span className="muted small">{records.length} items</span>
      </div>
      {records.length ? (
        <ul>
          {records.map((record) => (
            <li key={record.id}>
              <div>
                <p>{record.fileName}</p>
                <span className="muted small">
                  {formatBytes(record.fileSize)} • {record.status} •
                  {" "}{formatDateTime(record.updatedAt)}
                </span>
              </div>
              <div className="upload-list__meta">
                <span className="progress-pill">{record.progress || 0}%</span>
                <span className={`status-pill ${record.status || ""}`}>
                  {record.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No uploads yet.</p>
      )}
    </div>
  );
}
