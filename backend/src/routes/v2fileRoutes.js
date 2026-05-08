import express from "express";
import validate from "../middlewares/validate.js";
import v2fileSchema from "../validations/v2fileSchema.js";
import v2ctr from "../controllers/v2fileController.js";

const v2Routes = express.Router();

v2Routes.post("/start-multipart-upload", validate(v2fileSchema.startUploadSchema), v2ctr.startMultipartUpload);
v2Routes.post("/get-presigned-url", validate(v2fileSchema.preSignedSchema), v2ctr.getPreSignedUrl);
v2Routes.post("/complete-multipart-upload", validate(v2fileSchema.completeUploadSchema), v2ctr.completeUpload);
v2Routes.post("/save-uploaded-part", validate(v2fileSchema.saveUploadedPart) , v2ctr.saveUploadedPart);

export default v2Routes;