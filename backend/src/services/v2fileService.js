import v2fileRepo from "../repositories/v2fileRepo.js";
import s3 from "../configs/s3Config.js";
import { CreateMultipartUploadCommand, 
    UploadPartCommand, 
    CompleteMultipartUploadCommand, } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import ApiError from "../utils/ApiError.js"


const startMultiPartUpload = async ({fileType, fileSize, fileName, totalParts}) => {
    const mime = fileType.split("/")[1];
    const key = `${uuid()}.${mime}`

    const command = new CreateMultipartUploadCommand({
        Bucket:process.env.BUCKET_NAME,
        Key:key,
        ContentType:fileType
    });

    const response = await s3.send(command);

    // console.log(response);

    const data = {
        uploadId:response.UploadId,
        fileName:fileName,
        key:key,
        fileType:fileType,
        mimeType:mime,
        fileSize:fileSize,
        fileExtension: mime,
        totalParts:totalParts
    }

    const res = await v2fileRepo.createUpload(data);

    return {
        uploadId:response.UploadId,
        key:key,
        status:res.status
    }
}

const getPreSignedUrl = async({uploadId, key, partNumber}) => {
    const command = new UploadPartCommand({
        Bucket : process.env.BUCKET_NAME,
        Key : key,
        PartNumber : partNumber,
        UploadId:uploadId
    });

    const response = await getSignedUrl(s3, command, {expiresIn:3600});

    await v2fileRepo.changeStatus({uploadId, status:"UPLOADING"});

    return {
        url:response,
        key:key
    }
}

const saveUploadedPart = async({uploadId, partNumber, etag, chunkSize}) => {
    console.log(uploadId, partNumber, etag);
    const isUploadExist = await v2fileRepo.findByUploadId({uploadId});

    if(!isUploadExist) throw new ApiError(404, "uploaded data not found");

    const res =  await v2fileRepo.addUploadedPart({uploadId:uploadId, part:{partNumber, etag, chunkSize}});

    return res;
}

const completeUpload = async({key, uploadId, parts}) => {
    console.log(key, uploadId, parts);
    
    const sortedParts = parts.sort((a,b) => a.partNumber - b.partNumber );

    const command = new CompleteMultipartUploadCommand({
        UploadId:uploadId,
        Bucket:process.env.BUCKET_NAME,
        Key:key,
        MultipartUpload:{
            Parts:sortedParts,
        }
    });

    const response = await s3.send(command);

    console.log(response)

    await v2fileRepo.markAsCompleted({uploadId, finalUrl:response.Location});

    return {
        "status":"COMPLETED",
        "fileUrl":response.Location
    }
}


export default {
    startMultiPartUpload,
    getPreSignedUrl,
    saveUploadedPart,
    completeUpload,
}


