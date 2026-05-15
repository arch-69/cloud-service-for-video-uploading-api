import express from "express";
import validate from "../middlewares/validate.js";
import v2fileSchema from "../validations/v2fileSchema.js";
import v2ctr from "../controllers/v2fileController.js";
import auth from "../middlewares/auth.js";
import checkUserSubscribed from "../middlewares/checkPremium.js";
import videoStreamController from "../controllers/videoStreamController.js";

const v2Routes = express.Router();

v2Routes.post(
  "/start-multipart-upload",
  validate(v2fileSchema.startUploadSchema),
  auth.authenticate,
  auth.authorize("user", "admin"),
  checkUserSubscribed,
  v2ctr.startMultipartUpload,
);
v2Routes.post(
  "/get-presigned-url",
  validate(v2fileSchema.preSignedSchema),
  auth.authenticate,
  auth.authorize("user", "admin"),
  v2ctr.getPreSignedUrl,
);
v2Routes.post(
  "/complete-multipart-upload",
  validate(v2fileSchema.completeUploadSchema),
  auth.authenticate,
  auth.authorize("user", "admin"),
  v2ctr.completeUpload,
);
v2Routes.post(
  "/save-uploaded-part",
  validate(v2fileSchema.saveUploadedPart),
  auth.authenticate,
  auth.authorize("user", "admin"),
  v2ctr.saveUploadedPart,
);

v2Routes.post(
  "/get-uploaded-parts",
  // auth.authenticate,
  // auth.authorize("user", "admin"),
  v2ctr.getUploadedPart,
);

v2Routes.post(
  "/abort-multipart-upload",
  auth.authenticate,
  auth.authorize("user", "admin"),
  v2ctr.abortUploadingPart,
);

v2Routes.post(
  "/get-streaming-url",
  auth.authenticate,
  auth.authorize("user", "admin"),
  videoStreamController.getPresingedUrl,
);

export default v2Routes;
