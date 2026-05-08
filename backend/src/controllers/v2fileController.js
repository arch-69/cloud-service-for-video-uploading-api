import v2fileService from "../services/v2fileService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js"


const startMultipartUpload = asyncHandler( async (req, res) => {
  
    const response = await v2fileService.startMultiPartUpload(req.body);

    return res.status(201).json(
        new ApiResponse(201,"multi-part uploading started", response)
    );
});

const getPreSignedUrl = asyncHandler(async (req, res) => {
    const response = await v2fileService.getPreSignedUrl(req.body);
    return res.status(200).json(
        new ApiResponse(200,"success", response)
    );
})

const saveUploadedPart = asyncHandler(async (req, res)=>{
    
    const response = await v2fileService.saveUploadedPart(req.body);
    
    return res.status(200).json(
        new ApiResponse(200,"uploaded-part added successfully", response)
    );
})

const completeUpload = asyncHandler(async (req, res)=>{
    console.log(req.body);
    const response = await v2fileService.completeUpload(req.body);
    return res.status(200).json(
        new ApiResponse(200,"file uploaded successfully", response)
    );
})

export default {
    startMultipartUpload,
    getPreSignedUrl,
    saveUploadedPart,
    completeUpload
}

