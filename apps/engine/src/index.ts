import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { SetuMockProvider } from "./providers/setu-mock";

const app = new Hono();
// Initialize our Indian Banking Provider
const provider = new SetuMockProvider();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", cors());

// Health Check
app.get("/health", (c) => {
  return c.json({
    status: "active",
    service: "finance-tracker-engine",
    region: "ap-south-1",
    provider: "setu-mock",
    timestamp: new Date().toISOString(),
  });
});

/**
 * 1. Create Link Token
 * Generates a session token/URL to initialize the banking consent flow.
 */
app.post(
  "/link-token",
  zValidator("json", z.object({ userId: z.string() })),
  async (c) => {
    const { userId } = c.req.valid("json");
    const data = await provider.createLinkToken(userId);
    return c.json(data);
  }
);

/**
 * 2. Exchange Token
 * Swaps the public token received from the frontend for a permanent access token.
 */
app.post(
  "/exchange-token",
  zValidator("json", z.object({ publicToken: z.string() })),
  async (c) => {
    const { publicToken } = c.req.valid("json");
    const data = await provider.exchangeToken(publicToken);
    return c.json(data);
  }
);

/**
 * 3. Get Accounts
 * Fetches the list of bank accounts for a connected user.
 */
app.get("/accounts", async (c) => {
  // In a real app, you would validate this token against your DB
  const accessToken = c.req.header("Authorization")?.replace("Bearer ", "");
  
  if (!accessToken) {
    return c.json({ error: "Unauthorized: Missing Access Token" }, 401);
  }

  const accounts = await provider.getAccounts(accessToken);
  return c.json({ data: accounts });
});

/**
 * 4. Get Transactions
 * Fetches transactions for a specific account and date range.
 */
app.get(
  "/transactions",
  zValidator(
    "query",
    z.object({
      accountId: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
  ),
  async (c) => {
    const accessToken = c.req.header("Authorization")?.replace("Bearer ", "");
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized: Missing Access Token" }, 401);
    }

    const { accountId, from, to } = c.req.valid("query");

    // Default to last 30 days if no dates provided
    const toDate = to || new Date().toISOString().split("T")[0];
    const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const transactions = await provider.getTransactions(
      accessToken,
      accountId,
      fromDate,
      toDate
    );

    return c.json({ data: transactions });
  }
);

const port = parseInt(process.env.PORT || "8787");
console.log(`Bharat Engine running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};