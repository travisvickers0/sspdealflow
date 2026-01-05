import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb, index } from "drizzle-orm/pg-core";
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
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties, {
  status: propertyStatusSchema,
}).omit({
  id: true,
  slug: true,
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

// Leads table for investor qualification
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  accreditedConfirmed: integer("accredited_confirmed").notNull().default(0), // 0 = false, 1 = true (PostgreSQL boolean handling)
  capitalRange: text("capital_range").notNull(),
  investmentTimeline: text("investment_timeline").notNull(),
  primaryInterest: text("primary_interest").notNull(),
  status: text("status").default("new"), // new, qualified, called, converted, disqualified
  calendlyLink: text("calendly_link"),
  callOutcome: text("call_outcome"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  status: true,
  calendlyLink: true,
  callOutcome: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

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
