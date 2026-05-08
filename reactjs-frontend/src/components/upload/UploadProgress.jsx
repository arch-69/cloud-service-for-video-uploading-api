export default function UploadProgress({
  progress,
}) {

  return (

    <div>

      <h3>
        Progress: {progress}%
      </h3>

      <div
        style={{
          width: "100%",
          height: "20px",

          background: "#334155",

          borderRadius: "10px",

          overflow: "hidden",
        }}
      >

        <div
          style={{
            width: `${progress}%`,
            height: "100%",

            background: "#22c55e",

            transition:
              "width 0.3s ease",
          }}
        />

      </div>

    </div>
  );
}