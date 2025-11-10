import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import exportRouter from "../export/exportRouter.js";
import importRouter from "../import/importRouter.js";

export function registerRouter(app: OpenAPIHono) {
  // Application Routes
  app.route("/api", importRouter);
  app.route("/api", exportRouter);

  // Swagger UI
  app.get("/ui", swaggerUI({ url: "/doc" }));

  // OpenAPI JSON
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      title: "API",
      version: "1.0.0",
      description: "A simple API",
    },
    tags: [
      {
        name: "Imports",
        description: "Bulk import of users, articles and comments",
      },
      {
        name: "Exports",
        description: "Bulk export of users, articles and comments",
      },
    ],
  });

  // Error handling
  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  });

  // 404 handler
  app.notFound((c) => {
    return c.json({ error: "Route not found" }, 404);
  });
}
