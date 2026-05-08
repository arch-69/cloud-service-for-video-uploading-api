import { useState } from "react";
import axios from "axios";

const CHUNK_SIZE = 5 * 1024 * 1024;

function UploadFile() {

  const [progress, setProgress] = useState(0);

  const uploadFile = async (file) => {

    // STEP 1
    // START UPLOAD

    const startUploadResponse = await axios.post(
      "http://localhost:3200/api/v1/file/start-multipart-upload",
      {
        fileName: file.name,
        fileType: file.type,
      }
    );
    
    // console.log(startUploadResponse.data.data);

    const { uploadId, key } = startUploadResponse.data.data;

    console.log(uploadId);

    const parts = [];

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    let uploadedChunks = 0;

    // STEP 2
    // UPLOAD CHUNKS

    for (let index = 0; index < totalChunks; index++) {

      const start = index * CHUNK_SIZE;

      const end = Math.min(start + CHUNK_SIZE, file.size);

      const chunk = file.slice(start, end);

      const partNumber = index + 1;

      // GET SIGNED URL

      const uploadUrlResponse = await axios.post(
        "http://localhost:3200/api/v1/file/get-persigned-url",
        {
          key,
          uploadId,
          partNumber,
        }
      );

      console.log(uploadUrlResponse.data.data.url)

      const  signedUrl  = uploadUrlResponse.data.data.url;

      // console.log(signedUrl)

      // UPLOAD CHUNK TO S3

      const uploadResponse = await axios.put(
        signedUrl,
        chunk,
        {
          headers: {
            "Content-Type": file.type,
          },
        },
      );

      // GET ETAG

      const etag = uploadResponse.headers.etag;

      parts.push({
        ETag: etag,
        PartNumber: partNumber,
      });

      uploadedChunks++;

      setProgress(
        Math.round(
          (uploadedChunks / totalChunks) * 100
        )
      );
    }

    // STEP 3
    // COMPLETE UPLOAD

    await axios.post(
      "http://localhost:3200/api/v1/file/complete-multipart-upload",
      {
        key,
        uploadId,
        parts,
      }
    );

    alert("Upload Completed");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>S3 Chunk Upload</h1>

      <input
        type="file"
        onChange={(e) => uploadFile(e.target.files[0])}
      />

      <h2>{progress}%</h2>
    </div>
  );
}

export default UploadFile;