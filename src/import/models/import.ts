import { z } from "@hono/zod-openapi";
import { ResourceType } from "../../utils/common.js";

export const QueueStatusType = z
  .enum(["queued", "processing", "finished"])
  .openapi({
    description: "Current processing status of the import job",
    example: "queued",
  });
export type QueueStatusType = z.infer<typeof QueueStatusType>;

export const ImportQuerySchema = z.object({
  resource: ResourceType.openapi({
    param: {
      name: "resource",
      in: "query",
    },
    example: "users",
    description: "Type of resource to import",
  }),
});

export const ImportQueryParamSchema = z.object({
  "x-key": z.string().openapi({
    param: {
      name: "x-key",
      in: "header",
    },
    example: "hu32h4u3hu",
    description: "Request Key",
  }),
});

export const ImportJobResponseSchema = z.object({
  job_id: z.string().openapi({
    example: "job_abc123",
  }),
  resource: ResourceType.openapi({
    example: "users",
  }),
  status: QueueStatusType.openapi({
    example: "queued",
  }),
  message: z.string().openapi({
    example: "Import job started for users",
  }),
});

export const ImportGetJobStatusSchema = z.object({
  job_id: z.string().openapi({
    example: "job_abc123",
  }),
  status: QueueStatusType.openapi({
    example: "queued",
  }),
  success: z.string().openapi({
    example: "20",
  }),
  errors: z.string().openapi({
    example: "10",
  }),
});

export const ImportJobRequestParamSchema = z.object({
  job_id: z.string().openapi({
    param: {
      name: "job_id",
      in: "path",
    },
    example: "huru2312-fwqf2-t23-gw-2424",
    description: "Job id",
  }),
});
