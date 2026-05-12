import s3 from "../configs/s3Config.js";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

const startMultiPartUpload = async ({ fileType }) => {
  const key = `${uuid()}.${fileType.split("/")[1]}`;
  console.log("serivce file type: ", fileType);

  const command = new CreateMultipartUploadCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const response = await s3.send(command);

  return {
    uploadId: response.UploadId,
    key: key,
  };
};

const generatePreSignedUrl = async ({ key, uploadId, partNumber }) => {
  const command = new UploadPartCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return {
    url: url,
    key: key,
  };
};

const completeMultiPartUpload = async ({ key, uploadId, parts }) => {
  const sortedParts = parts.sort((a, b) => a.PartNumber - b.PartNumber);

  const command = new CompleteMultipartUploadCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: sortedParts,
    },
  });

  const response = await s3.send(command);

  console.log(key);

  return {
    uploadId: response.UploadId,
    key: key,
  };
};

export default {
  startMultiPartUpload,
  generatePreSignedUrl,
  completeMultiPartUpload,
};
