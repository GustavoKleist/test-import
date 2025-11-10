import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { streamText } from "hono/streaming";
import { FormatType, ResourceType } from "../utils/common.js";
import { log } from "../utils/logger.js";
import { ExportQuerySchema } from "./model/export.js";
import {
  exportArticles,
  exportComments,
  exportUsers,
} from "./services/exportData.js";

const exportRouter = new OpenAPIHono();

/**
 * GET /v1/exports — Stream export via query params
 */
const exportContent = createRoute({
  method: "get",
  path: "/v1/exports",
  tags: ["Exports"],
  summary: "Stream export of content",
  description: "Streams exported content directly in the response.",
  request: {
    query: ExportQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/octet-stream": {
          schema: {
            type: "string",
            format: "binary",
          },
        },
      },
      description: "Streamed export file",
    },
  },
});

exportRouter.openapi(exportContent, async (c) => {
  const { resource, format } = c.req.valid("query");

  return streamText(c, async (stream) => {
    switch (resource) {
      case ResourceType.enum.articles: {
        log().info({ resource }, "Export started");
        const articleFetcher = exportArticles(format);

        for await (const articles of articleFetcher) {
          for (const article of articles) {
            await stream.writeln(JSON.stringify(article));
          }
        }
        break;
      }
      case ResourceType.enum.users: {
        log().info({ resource }, "Export started");
        const userFetcher = exportUsers(format);

        for await (const users of userFetcher) {
          for (const user of users) {
            await stream.writeln(JSON.stringify(user));
          }
        }
        break;
      }
      case ResourceType.enum.comments: {
        log().info({ resource }, "Export started");
        const commentsFetcher = exportComments(format);

        for await (const comments of commentsFetcher) {
          for (const comment of comments) {
            await stream.writeln(JSON.stringify(comment));
          }
        }
        break;
      }
    }
  });
});

/**
 * POST /v1/exports — Stream export via multipart form data
 */
const exportContentPost = createRoute({
  method: "post",
  path: "/v1/exports/",
  tags: ["Exports"],
  summary: "Async export of content",
  description: "Performs async export using multipart form data input.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              resource: {
                type: "string",
                enum: ["users", "articles", "comments"],
                description: "Type of content to export",
              },
              format: {
                type: "string",
                enum: ["ndjson"],
                default: "ndjson",
                description: "Output format of the export file",
              },
            },
            required: ["resource", "format"],
            example: {
              resource: "users",
              format: "ndjson",
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/octet-stream": {
          schema: {
            type: "string",
            format: "binary",
          },
        },
      },
      description: "Streamed export file",
    },
  },
});

exportRouter.openapi(exportContentPost, async (c) => {
  const { resource, format } = await c.req.parseBody();

  return streamText(c, async (stream) => {
    switch (resource) {
      case ResourceType.enum.articles: {
        log().info({ resource }, "Export started");
        const articleFetcher = exportArticles(format as FormatType);

        for await (const articles of articleFetcher) {
          for (const article of articles) {
            await stream.writeln(JSON.stringify(article));
          }
        }
        break;
      }
      case ResourceType.enum.users: {
        log().info({ resource }, "Export started");
        const userFetcher = exportUsers(format as FormatType);

        for await (const users of userFetcher) {
          for (const user of users) {
            await stream.writeln(JSON.stringify(user));
          }
        }
        break;
      }
      case ResourceType.enum.comments: {
        log().info({ resource }, "Export started");
        const commentsFetcher = exportComments(format as FormatType);

        for await (const comments of commentsFetcher) {
          for (const comment of comments) {
            await stream.writeln(JSON.stringify(comment));
          }
        }
        break;
      }
    }
  });
});

export default exportRouter;
