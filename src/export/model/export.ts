import { z } from "@hono/zod-openapi";
import { FormatType, ResourceType } from "../../utils/common.js";

/**
 * Schema for export query parameters.
 * Defines which resource and format are being exported.
 */
export const ExportQuerySchema = z.object({
  resource: ResourceType.openapi({
    param: {
      name: "resource",
      in: "query",
      required: true,
    },
    example: ResourceType.enum.users,
    description: "Type of resource to export (e.g., users, articles, etc.)",
  }),
  format: FormatType.openapi({
    param: {
      name: "format",
      in: "query",
      required: true,
    },
    example: FormatType.enum.ndjson,
    description: "Type of format to export (e.g. ndjson)",
  }),
});
