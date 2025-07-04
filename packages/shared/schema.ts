import { pgTable, text, serial, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export interface AttributeDef {
  name: string;
  description: string;
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<'user' | 'admin' | 'super_admin'>().notNull().default('user'),
});

export const formConfigs = pgTable("form_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  purpose: text("purpose").notNull(),
  logoUrl: text("logo_url"),
  title: text("title").notNull(),
  description: text("description"),
  formSchema: jsonb("form_schema").notNull(),
  metadata: jsonb("metadata").notNull(),
  proofDef: jsonb("proof_def").$type<Record<string, string[]>>(),
  proofDefId: text("proof_def_id"),
  proofRequests: jsonb("proof_requests").default([]),
  revocationPolicies: jsonb("revocation_policies").$type<Record<string, boolean>>().default({}),
  isPublic: boolean("is_public").notNull().default(false),
  isTemplate: boolean("is_template").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(false),
  publicSlug: text("public_slug"),
  publishedAt: timestamp("published_at"),
  proofTransport: text("proof_transport").$type<'connection' | 'oob'>(),
  authorId: text("author_id").notNull().default("demo"),
  authorName: text("author_name").notNull().default("Demo User"),
  authorOrg: text("author_org"),
  clonedFrom: integer("cloned_from"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  publishedSlugIndex: index("form_configs_published_slug_idx").on(table.isPublished, table.publicSlug),
}));

export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formConfigId: integer("form_config_id").notNull().references(() => formConfigs.id),
  submissionData: jsonb("submission_data").notNull(),
  verifiedFields: jsonb("verified_fields").default(null), // Fields that were verified via VC
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const credentialDefinitions = pgTable("credential_definitions", {
  id: serial("id").primaryKey(),
  credentialType: text("credential_type").notNull(),
  issuerDid: text("issuer_did"),
  attributes: jsonb("attributes").notNull(), // Array of available attributes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface OCAOverlay {
  type: string;
  data: any;
}

export const credentialTemplates = pgTable("credential_templates", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().unique(),
  version: text("version").notNull(),
  schemaId: text("schema_id").notNull(),
  credDefId: text("cred_def_id").notNull(),
  issuerDid: text("issuer_did").notNull(),
  overlays: jsonb("overlays").$type<OCAOverlay[]>().notNull().default([]),
  governanceUrl: text("governance_url"),
  schemaUrl: text("schema_url"),
  attributes: jsonb("attributes").$type<AttributeDef[]>().notNull().default([]),
  isPredefined: boolean("is_predefined").notNull().default(false),
  ecosystem: text("ecosystem"),
  interopProfile: text("interop_profile"),
  compatibleWallets: jsonb("compatible_wallets").$type<string[]>().default([]),
  walletRestricted: boolean("wallet_restricted").notNull().default(false),
  branding: jsonb("branding").$type<Record<string, any>>().default({}),
  metaOverlay: jsonb("meta_overlay").$type<Record<string, any>>().default({}),
  ledgerNetwork: text("ledger_network").notNull().default('BCOVRIN_TEST'),
  primaryColor: text("primary_color").default('#4F46E5'),
  brandBgUrl: text("brand_bg_url"),
  brandLogoUrl: text("brand_logo_url"),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const credentialAttributes = pgTable("credential_attributes", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => credentialTemplates.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description").default(''),
  pos: integer("pos").notNull().default(0),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFormConfigSchema = createInsertSchema(formConfigs).pick({
  name: true,
  slug: true,
  purpose: true,
  logoUrl: true,
  title: true,
  description: true,
  formSchema: true,
  metadata: true,
  proofRequests: true,
  revocationPolicies: true,
  isPublic: true,
  authorId: true,
  authorName: true,
  authorOrg: true,
  clonedFrom: true,
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).pick({
  formConfigId: true,
  submissionData: true,
  verifiedFields: true,
});

export const insertCredentialDefinitionSchema = createInsertSchema(credentialDefinitions).pick({
  credentialType: true,
  issuerDid: true,
  attributes: true,
});

export const insertCredentialTemplateSchema = createInsertSchema(credentialTemplates).pick({
  label: true,
  version: true,
  schemaId: true,
  credDefId: true,
  issuerDid: true,
  schemaUrl: true,
  attributes: true,
  isPredefined: true,
  ecosystem: true,
  interopProfile: true,
  compatibleWallets: true,
  walletRestricted: true,
  branding: true,
  metaOverlay: true,
  ledgerNetwork: true,
  primaryColor: true,
  brandBgUrl: true,
  brandLogoUrl: true,
  governanceUrl: true,
});

export const insertCredentialAttributeSchema = createInsertSchema(credentialAttributes).pick({
  templateId: true,
  name: true,
  description: true,
  pos: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FormConfig = typeof formConfigs.$inferSelect;
export type InsertFormConfig = z.infer<typeof insertFormConfigSchema>;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;

export type CredentialDefinition = typeof credentialDefinitions.$inferSelect;
export type InsertCredentialDefinition = z.infer<typeof insertCredentialDefinitionSchema>;

export type CredentialTemplate = typeof credentialTemplates.$inferSelect;
export type InsertCredentialTemplate = z.infer<typeof insertCredentialTemplateSchema>;

export type CredentialAttribute = typeof credentialAttributes.$inferSelect;
export type InsertCredentialAttribute = z.infer<typeof insertCredentialAttributeSchema>;

// Extended types for VC integration
export interface DataSourceMetadata {
  type: 'freetext' | 'picklist' | 'verified';
  options?: string[]; // For picklist
  vcMapping?: {
    credentialType: string;
    attributeName: string;
    issuerDid?: string;
  }; // For verified attributes
}

export interface FieldMetadata {
  [fieldKey: string]: DataSourceMetadata;
}

export interface ProofRequest {
  id: string;
  credentialType: string;
  issuerDid?: string;
  attributes: string[];
  nonce?: string;
}

export interface VerificationResult {
  verified: boolean;
  attributes: Record<string, any>;
  timestamp: string;
}
