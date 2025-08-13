import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const hypotheses = pgTable("hypotheses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  domain: text("domain").notNull(),
  question: text("question").notNull(),
  variables: text("variables").notNull(),
  constraints: text("constraints"),
  generatedContent: text("generated_content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const methods = pgTable("methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  hypothesisId: varchar("hypothesis_id").references(() => hypotheses.id),
  hypothesis: text("hypothesis").notNull(),
  variables: text("variables").notNull(),
  constraints: text("constraints"),
  primaryMethods: jsonb("primary_methods").notNull(),
  alternativeMethod: jsonb("alternative_method"),
  confidence: real("confidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sampleSizeCalculations = pgTable("sample_size_calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  testType: text("test_type").notNull(),
  effectSize: real("effect_size").notNull(),
  power: real("power").notNull(),
  alpha: real("alpha").notNull(),
  sampleSize: integer("sample_size").notNull(),
  totalSampleSize: integer("total_sample_size").notNull(),
  adjustedSampleSize: integer("adjusted_sample_size").notNull(),
  formula: text("formula").notNull(),
  assumptions: text("assumptions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const citationVerifications = pgTable("citation_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  claim: text("claim").notNull(),
  verificationStatus: text("verification_status").notNull(), // supported, partially_supported, not_supported
  confidence: real("confidence").notNull(),
  supportingEvidence: jsonb("supporting_evidence").notNull(),
  aiAnalysis: text("ai_analysis").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const protocols = pgTable("protocols", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  methodIds: text("method_ids").array().notNull(),
  title: text("title").notNull(),
  format: text("format").notNull(), // pdf, docx, json, txt
  content: jsonb("content").notNull(),
  includeCitations: boolean("include_citations").default(true),
  includeEquipment: boolean("include_equipment").default(true),
  includeCostEstimates: boolean("include_cost_estimates").default(false),
  exportedAt: timestamp("exported_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHypothesisSchema = createInsertSchema(hypotheses).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertMethodSchema = createInsertSchema(methods).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertSampleSizeCalculationSchema = createInsertSchema(sampleSizeCalculations).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertCitationVerificationSchema = createInsertSchema(citationVerifications).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertProtocolSchema = createInsertSchema(protocols).omit({
  id: true,
  userId: true,
  exportedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHypothesis = z.infer<typeof insertHypothesisSchema>;
export type Hypothesis = typeof hypotheses.$inferSelect;
export type InsertMethod = z.infer<typeof insertMethodSchema>;
export type Method = typeof methods.$inferSelect;
export type InsertSampleSizeCalculation = z.infer<typeof insertSampleSizeCalculationSchema>;
export type SampleSizeCalculation = typeof sampleSizeCalculations.$inferSelect;
export type InsertCitationVerification = z.infer<typeof insertCitationVerificationSchema>;
export type CitationVerification = typeof citationVerifications.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;
export type Protocol = typeof protocols.$inferSelect;
