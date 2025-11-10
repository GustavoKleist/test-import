import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorResponseSchema } from "../utils/common.js";
import { log } from "../utils/logger.js";
import {
  ImportGetJobStatusSchema,
  ImportJobRequestParamSchema,
  ImportJobResponseSchema,
  ImportQueryParamSchema,
  ImportQuerySchema,
  QueueStatusType,
} from "./models/import.js";
import { JobRepository } from "./repositories/jobRepository.js";
import { enqueueImportFileJob } from "./services/importFile.js";
import { enqueueImportFileUrlJob } from "./services/importFileUrl.js";

const importRouter = new OpenAPIHono();

const createImportRoute = createRoute({
  method: "post",
  path: "/v1/import",
  tags: ["Imports"],
  summary: "Start a bulk import job",
  description: "Import users, articles, or comments from a file upload or URL",
  request: {
    query: ImportQuerySchema,
    headers: ImportQueryParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ImportJobResponseSchema,
        },
      },
      description: "Import job started successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Bad request - missing file or invalid resource type",
    },
    409: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Duplicate job detected (idempotency key)",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Error on job creation",
    },
  },
});

importRouter.openapi(createImportRoute, async (c) => {
  const { resource } = c.req.valid("query");
  const jobKey = c.req.header("x-key") as string;
  const jobRepository = new JobRepository();
  let jobId: string = "";

  // Parse multipart form data
  const body = await c.req.parseBody();
  const file = body.file as File;
  const file_url = body.file_url as string;

  // Validate that we have either file or file_url
  if (!file && !file_url) {
    log().error({ jobKey }, "Either file or file_url is required");
    return c.json({ message: "Either file or file_url is required" }, 400);
  }

  const jobExists = await jobRepository.checkJobExists(jobKey);

  if (jobExists) {
    log().info({ jobKey }, "Job already processed");
    return c.json(
      {
        job_id: jobExists.id,
        resource,
        status: jobExists.status,
        message: `Job already processed`,
      },
      200
    );
  }

  if (file) {
    jobId = await enqueueImportFileJob(resource, file, jobKey);
  }

  if (file_url) {
    jobId = await enqueueImportFileUrlJob(resource, file_url, jobKey);
  }

  try {
    await jobRepository.create({
      job_key: jobId,
      resource,
      status: QueueStatusType.enum.queued,
    });

    log().info({ jobKey }, "Import job successful");
    return c.json(
      {
        job_id: jobId,
        resource,
        status: QueueStatusType.enum.queued,
        message: `Import job successful for ${resource}`,
      },
      200
    );
  } catch (error: any) {
    log().error({ jobKey }, "Error on job creation");
    return c.json({ message: "Error on job creation" }, 500);
  }
});

const getImportRoute = createRoute({
  method: "get",
  path: "/v1/import/:job_id/",
  tags: ["Imports"],
  summary: "Get import job status",
  description: "Get import job status by id",
  request: {
    params: ImportJobRequestParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ImportGetJobStatusSchema,
        },
      },
      description: "Import job started successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Bad request - missing file or invalid job id",
    },
  },
});

importRouter.openapi(getImportRoute, async (c) => {
  const job_id = c.req.param("job_id");

  const jobRepository = new JobRepository();

  if (!job_id) {
    log().error({ job_id }, "Missing job id on request");
    return c.json({ message: "Bad request - missing job id" }, 400);
  }

  try {
    const job = await jobRepository.getById(job_id);

    log().info({ job_id }, "Job find by id success");
    return c.json(
      {
        job_id: job.id,
        status: job.status,
        success: String(job.success),
        errors: String(job.errors),
      },
      200
    );
  } catch (error: any) {
    log().error({ job_id }, "Job id not found");
    return c.json({ message: "Error on job fetch" }, 400);
  }
});

export default importRouter;
