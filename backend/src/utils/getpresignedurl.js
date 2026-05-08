import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv"
dotenv.config({});

const client = new S3Client({

    region:"eu-north-1",
    credentials:{
            accessKeyId:process.env.ACCESS_KEY_ID_S3,
            secretAccessKey:process.env.SECRET_KEY_ID_S3
    }
    
});


const generatePreSignedUrl = ({bucket, key}) => {
    const command = new PutObjectCommand({
            Bucket:bucket,
            Key:key
        });
    return getSignedUrl(client, command, {expiresIn:3600});
    
}

export default generatePreSignedUrl;