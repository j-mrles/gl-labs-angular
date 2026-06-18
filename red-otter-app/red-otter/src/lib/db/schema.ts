import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name"),
  googleId: text("google_id").unique(),
  subscriptionStatus: text("subscription_status", {
    enum: ["trialing", "active", "past_due", "canceled", "none"],
  }).notNull().default("none"),
  trialEndsAt: integer("trial_ends_at", { mode: "timestamp" }),
  trialReportsUsed: integer("trial_reports_used").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  listingUrl: text("listing_url").notNull(),
  propertyAddress: text("property_address"),
  rawScrapedData: text("raw_scraped_data", { mode: "json" }),
  otisScore: integer("otis_score"),
  analysis: text("analysis", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const savedProperties = sqliteTable("saved_properties", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  reportId: text("report_id").notNull().references(() => reports.id),
  notes: text("notes"),
  priceAtSave: real("price_at_save"),
  currentPrice: real("current_price"),
  alertEnabled: integer("alert_enabled", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  reportId: text("report_id").notNull().references(() => reports.id),
  role: text("role", { enum: ["user", "otis"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  plan: text("plan").notNull().default("monthly"),
  status: text("status", {
    enum: ["trialing", "active", "past_due", "canceled", "unpaid"],
  }).notNull(),
  currentPeriodStart: integer("current_period_start", { mode: "timestamp" }),
  currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
});

export const notificationPrefs = sqliteTable("notification_prefs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  emailReportReady: integer("email_report_ready", { mode: "boolean" }).notNull().default(true),
  emailWeeklyDigest: integer("email_weekly_digest", { mode: "boolean" }).notNull().default(false),
  emailPriceAlerts: integer("email_price_alerts", { mode: "boolean" }).notNull().default(true),
});

export const otisChatMessages = sqliteTable("otis_chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
