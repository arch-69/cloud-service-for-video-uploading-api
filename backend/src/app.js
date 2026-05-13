import express from "express";
import router from "./routes/index.js";
import cors from "cors";
import v2Routes from "./routes/v2fileRoutes.js";
import Upload from "./models/uploadFile.js";
import ApiError from "./utils/ApiError.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("HTTP " + req.method + " - " + req.url + " - " + req.body);
  next();
});

app.use("/api/v1", router);
app.use("/api/v2/file", v2Routes);

// app.get("/", async (req, res)=>{
//     const bucket = process.env.BUCKET_NAME
//     const url = await generatePreSignedUrl({bucket:bucket, key:"file.jpg"});
//     console.log(url);
//     return res.status(200).json({"url":url});
// })

// app.post("/", async (req, res) => {
//   const uploadId = req.body.uploadId;
//   console.log(uploadId);
//   const data = await Upload.findOne(
//     { uploadId },
//     {
//       uploadedParts: 1,
//     },
//     { _id: false },
//   ).lean();

//   return res.status(200).json({ data: data });
// });

app.use((err, req, res, next) => {
  const errorCode =
    err instanceof ApiError ? err.statusCode : err.status || 500;
  res.status(errorCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

export default app;
