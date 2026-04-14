import { z } from "zod";

export const dateBucketSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "dateBucket must use YYYY-MM-DD");

export const siteKeyParamsSchema = z.object({
  siteKey: z.string().min(1, "siteKey is required"),
});

export const runIdParamsSchema = z.object({
  runId: z.string().min(1, "runId is required"),
});
