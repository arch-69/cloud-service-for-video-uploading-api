import UploadProgress
  from "./UploadProgress";

import UploadStatus
  from "./UploadStatus";

import {
  useMultipartUpload,
} from "../../hooks/useMultipartUpload";

export default function UploadComponent() {

  const {
    progress,
    status,
    uploadedParts,
    uploadFile,
    error,
  } = useMultipartUpload();

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        fontFamily: "Arial",
      }}
    >

      <div
        style={{
          width: "500px",
          background: "#1e293b",
          padding: "30px",
          borderRadius: "12px",

          boxShadow:
            "0px 0px 20px rgba(0,0,0,0.3)",
        }}
      >

        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Multipart Upload
        </h1>

        <input
          type="file"
          onChange={(e) =>
            uploadFile(
              e.target.files[0]
            )
          }
        />

        <div
          style={{
            marginTop: "30px",
          }}
        >

          <UploadProgress
            progress={progress}
          />

        </div>

        <div
          style={{
            marginTop: "20px",
          }}
        >

          <UploadStatus
            status={status}
          />

        </div>

        {error && (
          <div
            style={{
              marginTop: "16px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fecaca",
              padding: "10px 12px",
              borderRadius: "8px",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: "20px",
            maxHeight: "200px",
            overflow: "auto",
            background: "#0f172a",
            padding: "10px",
            borderRadius: "8px",
          }}
        >

          <h3>
            Uploaded Parts
          </h3>

          <pre>
            {JSON.stringify(
              uploadedParts,
              null,
              2
            )}
          </pre>

        </div>

      </div>

    </div>
  );
}