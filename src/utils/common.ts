import { z } from "@hono/zod-openapi";

export const ResourceType = z.enum(["users", "articles", "comments"]);
export type ResourceType = z.infer<typeof ResourceType>;

export const FormatType = z.enum(["ndjson"]);
export type FormatType = z.infer<typeof FormatType>;

export const ErrorResponseSchema = z.object({
  message: z.string().openapi({
    example: "Error description",
  }),
});
