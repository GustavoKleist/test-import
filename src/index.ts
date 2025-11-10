import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { registerRouter } from "./routes/index.js";

const app = new OpenAPIHono();

//Initialize Routes
registerRouter(app);

//Start server
serve(
  {
    fetch: app.fetch,
    port: Number.parseInt(process.env.PORT || "3000"),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
