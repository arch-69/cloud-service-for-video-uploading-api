import { z } from "zod";

const registrationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "name is required" }),
    email: z.string().email(),
    password: z.string(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export default {
  registrationSchema,
  loginSchema,
};
