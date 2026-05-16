import z from "zod";

const planSchema = z.object({
  body: z.object({
    name: z.string({ require_error: "name is required" }).trim(),

    storageLimit: z.number(),
    bandwidthLimit: z.number(),

    maxFileSize: z.number(),

    monthlyPrice: z.number(),
  }),
});

export default {
  planSchema,
};
