import { z } from "zod";

export const jsonScalarSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const jsonApiProviderConfigSchema = z.object({
  endpoint: z.string().url(),
  method: z.enum(["GET", "POST"]).default("GET"),
  headers: z.record(z.string()).default({}),
  query: z.record(z.string()).default({}),
  body: z.record(jsonScalarSchema).optional(),
  dataPath: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export type JsonApiProviderConfig = z.infer<typeof jsonApiProviderConfigSchema>;
