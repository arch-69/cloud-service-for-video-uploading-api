import { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function UploadPanel({
  onUpload,
  onPause,
  onResume,
  onCancel,
  status,
  progress,
  isPaused,
  currentUpload,
  bitrateHistory,
  error,
}) {
  const [fileName, setFileName] = useState("");

  const waveform = (bitrateHistory || []).length
    ? bitrateHistory
    : [0, 0, 0, 0, 0, 0, 0, 0];

  const maxValue = Math.max(...waveform, 1);
  const points = waveform.map((value, index) => {
    const x = (index / (waveform.length - 1 || 1)) * 100;
    const normalized = value / maxValue;
    const y = 50 - normalized * 32;
    return { x, y };
  });

  const smoothPath = points.length
    ? points.reduce((acc, point, index, array) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`;
        }

        const prev = array[index - 1];
        const next = array[index + 1] || point;
        const controlX1 = prev.x + (point.x - prev.x) / 2;
        const controlY1 = prev.y + (point.y - prev.y) / 2;
        const controlX2 = point.x - (next.x - prev.x) / 6;
        const controlY2 = point.y - (next.y - prev.y) / 6;

        return `${acc} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${point.x} ${point.y}`;
      }, "")
    : "";

  const heartbeatTone =
    status === "FAILED" || status === "CANCELLED"
      ? "danger"
      : status === "PAUSED"
      ? "paused"
      : "success";

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onUpload(file);
    }
  };

  return (
    <div className="card upload-panel">
      <div className="upload-panel__header">
        <div>
          <h3>Smart multipart upload</h3>
          <p className="muted">
            Secure, resumable uploads with parallel acceleration.
          </p>
        </div>
        <div className="chip">Multi-part v2</div>
      </div>

      <div className="upload-drop">
        <UploadCloud size={28} />
        <div>
          <p>{fileName || "Choose a file to upload"}</p>
          <span className="muted small">Max 5GB • Encrypted in transit</span>
        </div>
        <label className="secondary-button">
          Select file
          <input type="file" onChange={handleUpload} />
        </label>
      </div>

      {/* Show billing CTA when user hit rate/usage limit (429) */}
      {error && error.response?.status === 429 && (
        <div className="card" style={{ marginTop: 16, borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ margin: 0 }}>Upgrade required</h3>
          <p style={{ marginTop: 8 }}>
            Your free plan has expired or you've reached your usage limit. Upgrade to the Premium plan to continue uploading large files and enjoy higher reliability and faster uploads.
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              className="primary-button"
              onClick={() => {
                // use SPA nav so app responds without full reload
                window.history.pushState({}, '', '/pricing');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              View pricing & upgrade
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                window.history.pushState({}, '', '/support');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              Contact support
            </button>
          </div>
        </div>
      )}

      <div className="upload-meta">
        <div>
          <p className="muted small">Status</p>
          <strong>{status}</strong>
        </div>
        <div>
          <p className="muted small">Progress</p>
          <strong>{progress}%</strong>
        </div>
        <div>
          <p className="muted small">Throughput</p>
          <strong>
            {bitrateHistory?.length
              ? `${bitrateHistory[bitrateHistory.length - 1]} Mbps`
              : "—"}
          </strong>
        </div>
      </div>

      <div className={`bitrate-graph heartbeat ${heartbeatTone}`}>
        <svg
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          className={status === "UPLOADING" ? "pulse" : ""}
        >
          <path
            d={smoothPath}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="progress-bar">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="upload-actions">
        <button
          className="ghost-button"
          type="button"
          onClick={isPaused ? onResume : onPause}
          disabled={!currentUpload || status === "COMPLETED"}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          className="ghost-button danger"
          type="button"
          onClick={onCancel}
          disabled={!currentUpload || status === "COMPLETED"}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
