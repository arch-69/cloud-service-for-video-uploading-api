import express from "express";
import fileCtr from "../controllers/fileController.js";

const fileRoutes = express.Router();

fileRoutes.post("/start-multipart-upload", fileCtr.startMultipartUpload);
fileRoutes.post("/get-persigned-url", fileCtr.generatePreSignedUrl);
fileRoutes.post("/complete-multipart-upload", fileCtr.completeMultiPartUpload);

export default fileRoutes;