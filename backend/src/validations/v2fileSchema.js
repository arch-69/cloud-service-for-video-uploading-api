import { z } from "zod";

const startUploadSchema = z.object({
  body: z.object({
    fileName: z.string(),
    fileSize: z.number(),
    fileType: z.string(),
    totalParts: z.number()
  })
});

const preSignedSchema = z.object({
    body:z.object({
        uploadId:z.string(), 
        key:z.string(), 
        partNumber:z.number()

    })
});

const saveUploadedPart = z.object({
    body:z.object({
        uploadId:z.string(), 
        partNumber:z.number(), 
        etag:z.string(),
    })
})

const completeUploadSchema = z.object({
    body:z.object({
        key:z.string(), 
        uploadId:z.string(), 
        parts:z.array(z.object({
            ETag:z.string(),
            PartNumber:z.number()
        }))
    })
})

export default {
    startUploadSchema,
    preSignedSchema,
    saveUploadedPart,
    completeUploadSchema
}