import { pgTable, text, timestamp, boolean, uuid, jsonb, date, integer } from "drizzle-orm/pg-core";

// --- Users & Teams (Core) ---

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  // PAN is mandatory for high-value financial tracking in India
  panNumber: text("pan_number"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  logoUrl: text("logo_url"),
  // GSTIN for tax compliance
  gstin: text("gstin"),
  // Default Fiscal Year (April-March) setting
  fiscalYearStartMonth: integer("fiscal_year_start_month").default(4), // 4 = April
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role", { enum: ["owner", "member", "observer"] }).default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Financial Data ---

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  currency: text("currency").default("INR").notNull(),
  // Support for 'savings', 'current', 'od' (overdraft)
  type: text("type").notNull(), 
  balance: integer("balance").default(0).notNull(), // Stored in cents/paisa
  institutionId: text("institution_id"), // Link to AA provider ID
  accountNumber: text("account_number"), // Last 4 digits
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  accountId: uuid("account_id").references(() => bankAccounts.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  amount: integer("amount").notNull(), // Paisa
  currency: text("currency").default("INR").notNull(),
  description: text("description"),
  // UPI Method Tracking
  method: text("method", { enum: ["upi", "neft", "rtgs", "imps", "card", "cash", "other"] }).default("other"),
  status: text("status", { enum: ["posted", "pending"] }).default("posted"),
  // JSONB column to store raw UPI/Bank metadata for AI enrichment
  metadata: jsonb("metadata"), 
  categoryId: uuid("category_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }), // Nullable for system categories
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  color: text("color"),
});

// --- Invoicing (GST Compliant) ---

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  // GSTIN is crucial for B2B input credit
  gstin: text("gstin"),
  pan: text("pan"),
  addressLine1: text("address_line_1"),
  city: text("city"),
  // State Code (e.g., 27 for Maharashtra) - Required for GST calculation
  stateCode: text("state_code"), 
  pincode: text("pincode"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }).notNull(),
  customerId: uuid("customer_id").references(() => customers.id),
  invoiceNumber: text("invoice_number").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status", { enum: ["draft", "sent", "paid", "overdue", "void"] }).default("draft"),
  currency: text("currency").default("INR").notNull(),
  subtotal: integer("subtotal").default(0),
  taxTotal: integer("tax_total").default(0), // Total GST
  total: integer("total").default(0),
  // Specific tax breakdown
  cgst: integer("cgst").default(0),
  sgst: integer("sgst").default(0),
  igst: integer("igst").default(0),
  token: text("token").unique(), // For public view link
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").notNull(),
  // HSN Code is mandatory for GST invoices
  hsnCode: text("hsn_code"),
  taxRate: integer("tax_rate").default(1800), // Stored as basis points (18.00% = 1800)
});