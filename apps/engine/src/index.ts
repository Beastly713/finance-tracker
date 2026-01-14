import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());

// Health Check
app.get("/health", (c) => {
  return c.json({
    status: "active",
    service: "finance-tracker-engine",
    region: "ap-south-1", // Indicating India region preference
    timestamp: new Date().toISOString(),
  });
});

// Start the server
const port = parseInt(process.env.PORT || "8787");
console.log(`🚀 Bharat Engine running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};