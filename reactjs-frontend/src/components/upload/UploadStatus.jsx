export default function UploadStatus({
  status,
}) {

  const getColor = () => {

    switch (status) {

      case "COMPLETED":
        return "#22c55e";

      case "FAILED":
        return "#ef4444";

      case "UPLOADING":
        return "#3b82f6";

      default:
        return "#ffffff";
    }
  };

  return (

    <h3
      style={{
        color: getColor(),
      }}
    >
      Status: {status}
    </h3>
  );
}