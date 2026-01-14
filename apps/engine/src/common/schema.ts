import { z } from "zod";

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  currency: z.string().default("INR"),
  type: z.enum(["depository", "credit", "other_asset", "loan"]),
  balance: z.object({
    current: z.number(),
    available: z.number().optional(),
    limit: z.number().optional(),
  }),
  institutionId: z.string().optional(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO Date YYYY-MM-DD
  amount: z.number(),
  currency: z.string().default("INR"),
  description: z.string(),
  method: z.enum(["upi", "neft", "rtgs", "imps", "card", "cash", "other"]).optional(),
  status: z.enum(["posted", "pending"]),
  category: z.string().optional(),
  // JSONB metadata for Indian context (UPI handles, Reference numbers)
  metadata: z.record(z.string(), z.any()).optional(),
  internalId: z.string().optional(),
  bankAccountId: z.string().optional(),
});

export type Account = z.infer<typeof AccountSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;