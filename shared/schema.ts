import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, doublePrecision, timestamp, jsonb, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const propertyStatusSchema = z.enum(["needs_funding", "committed", "funded", "archived", "AVAILABLE", "FUNDED", "SOLD"]);
export type PropertyStatus = z.infer<typeof propertyStatusSchema>;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  unsubscribedFromDeals: timestamp("unsubscribed_from_deals"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Properties table
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").unique(),
  // Deal page mode (controls AVAILABLE/FUNDED/SOLD rendering)
  status: text("status").notNull().default("AVAILABLE"),
  
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  
  purchasePrice: integer("purchase_price").notNull(),
  estimatedEquity: integer("estimated_equity").notNull(),
  beds: integer("beds").notNull(),
  baths: real("baths").notNull(),
  squareFeet: integer("square_feet").notNull(),
  
  closingDate: text("closing_date").notNull(),
  bpoValue: integer("bpo_value").notNull(),
  rehabBudget: integer("rehab_budget").notNull().default(0),
  
  fundingProgress: integer("funding_progress").notNull().default(0),

  // SOLD-only fields (all optional to avoid breaking older records)
  exitDate: text("exit_date"),
  finalSalePrice: integer("final_sale_price"),
  holdPeriodMonths: integer("hold_period_months"),
  totalProjectProfit: integer("total_project_profit"),
  investorProfit: integer("investor_profit"),
  sponsorProfit: integer("sponsor_profit"),
  realizedROI: real("realized_roi"),
  
  mainPhotoUrl: text("main_photo_url"),
  galleryPhotoUrls: text("gallery_photo_urls").array().default(sql`ARRAY[]::text[]`),
  
  documents: jsonb("documents").default(sql`'[]'::jsonb`),
  
  comps: jsonb("comps").default(sql`'[]'::jsonb`),
  
  description: text("description"),

  // Timestamp of when the "new deal" alert email was sent (null = never sent)
  dealAlertSentAt: timestamp("deal_alert_sent_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const closedDeals = pgTable("closed_deals", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),

  // Property info
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip"),
  source: text("source"),

  // Photos
  mainPhotoUrl: text("main_photo_url"),
  galleryPhotoUrls: text("gallery_photo_urls").array(),

  // Key financials
  purchasePrice: doublePrecision("purchase_price"),
  salePrice: doublePrecision("sale_price"),
  dealProfit: doublePrecision("deal_profit"),
  investorRoi: real("investor_roi"),
  annualizedRoi: real("annualized_roi"),
  totalInvestorPayoff: doublePrecision("total_investor_payoff"),
  investorCapital: doublePrecision("investor_capital"),
  investorProfitShare: doublePrecision("investor_profit_share"),

  // Timeline
  acquisitionDate: text("acquisition_date"),
  closeDate: text("close_date"),
  daysHeld: integer("days_held"),

  // Sources of funds
  netSaleProceeds: doublePrecision("net_sale_proceeds"),
  excessDrawReimbursement: doublePrecision("excess_draw_reimbursement"),
  totalSources: doublePrecision("total_sources"),

  // Uses of funds
  cashToClose: doublePrecision("cash_to_close"),
  earnestMoney: doublePrecision("earnest_money"),
  acquisitionCosts: doublePrecision("acquisition_costs"),
  rehabCosts: doublePrecision("rehab_costs"),
  holdingCosts: doublePrecision("holding_costs"),
  salesCosts: doublePrecision("sales_costs"),
  totalUses: doublePrecision("total_uses"),

  // Cost line items
  costLineItems: jsonb("cost_line_items"),

  // JV split
  operatorShare: doublePrecision("operator_share"),
  partnerShare: doublePrecision("partner_share"),

  // Meta
  reportGeneratedAt: text("report_generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ClosedDeal = typeof closedDeals.$inferSelect;
export type InsertClosedDeal = typeof closedDeals.$inferInsert;

export const insertPropertySchema = createInsertSchema(properties, {
  status: propertyStatusSchema,
}).omit({
  id: true,
  slug: true,
  dealAlertSentAt: true,
  createdAt: true,
  updatedAt: true,
});

// Utility function to generate slug from address
export function generatePropertySlug(address: string, city: string, state: string): string {
  return `${address}-${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const updatePropertySchema = insertPropertySchema.partial();

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;
export type Property = typeof properties.$inferSelect;

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(), // "create", "update", "delete", "upload"
  resourceType: text("resource_type").notNull(), // "property", "document", "photo"
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Document type for property documents
export const documentSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string().optional(),
  size: z.number().optional(),
});

export type PropertyDocument = z.infer<typeof documentSchema>;

// Comparable sale type for property comps
export const compSchema = z.object({
  id: z.string(),
  address: z.string(),
  price: z.number(),
  beds: z.number(),
  baths: z.number(),
  sqft: z.number(),
  soldDate: z.string(),
  distance: z.string().optional(),
});

export type PropertyComp = z.infer<typeof compSchema>;

// Leads table for investor qualification form
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  isAccredited: text("is_accredited").notNull(), // "true" or "false" as text
  capitalRange: text("capital_range").notNull(),
  investmentTimeline: text("investment_timeline").notNull(),
  primaryInterest: text("primary_interest").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  isAccredited: z.boolean(),
  capitalRange: z.string(),
  investmentTimeline: z.string(),
  primaryInterest: z.string(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export const propertyInterests = pgTable("property_interests", {
  id: serial("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  propertyAddress: text("property_address").notNull(),
  userId: text("user_id"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PropertyInterest = typeof propertyInterests.$inferSelect;
export type InsertPropertyInterest = typeof propertyInterests.$inferInsert;
