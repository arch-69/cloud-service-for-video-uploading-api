import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import fileServ from "../services/fileService.js";
import ApiResponse from "../utils/ApiResponse.js";
import v2fileService from "../services/v2fileService.js";

const startMultipartUpload = asyncHandler(async (req, res) => {
  const { fileType } = req.body;
  console.log("fileType: ", fileType);
  if (!fileType) throw new ApiError(400, "file-type is required", null);

  const { uploadId, key } = await fileServ.startMultiPartUpload({
    fileType: fileType,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "multi-part uploading started", { uploadId, key }),
    );
});

const generatePreSignedUrl = asyncHandler(async (req, res) => {
  const { key, uploadId, partNumber } = req.body;
  if (!key || !uploadId || !partNumber)
    throw new ApiError(400, "key, uploadId or partNumber is missing", null);

  const { url, key: k } = await fileServ.generatePreSignedUrl({
    key: key,
    uploadId: uploadId,
    partNumber: partNumber,
  });

  return res.status(200).json(
    new ApiResponse(200, "pre-signed url generated successfully!!", {
      url,
      k,
    }),
  );
});

const completeMultiPartUpload = asyncHandler(async (req, res) => {
  const { key, uploadId } = req.body;
  const parts = await v2fileService.getUploadedParts({ uploadId, key });
  console.log(parts);
  if (!key || !uploadId || !parts)
    throw new ApiError(400, "key, uploadId or parts is missing", null);

  const { key: k, uploadId: id } = await fileServ.completeMultiPartUpload({
    key: key,
    uploadId: uploadId,
    parts: parts,
  });

  return res.status(200).json(
    new ApiResponse(200, "uploaded successfully!!", {
      key: k,
      uploadId: id,
    }),
  );
});

export default {
  startMultipartUpload,
  generatePreSignedUrl,
  completeMultiPartUpload,
};
