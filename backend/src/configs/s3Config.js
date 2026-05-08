import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config({});

const s3 = new S3Client({
    region:process.env.S3_BUCKET_REGION,
    credentials:{
        accessKeyId:process.env.ACCESS_KEY_ID_S3,
        secretAccessKey:process.env.SECRET_KEY_ID_S3
    }
})

export default s3;

