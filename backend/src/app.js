import express from "express"
import errorHandler from "./middlewares/errorhandler.js"
import router from "./routes/index.js";
import cors from "cors";
import v2Routes from "./routes/v2fileRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extends:false}));

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

app.use(errorHandler);

export default app;