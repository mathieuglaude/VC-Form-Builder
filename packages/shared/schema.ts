import { pgTable, text, serial, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Type-safe data source types
export type DataSource = 'verified' | 'manual';

export interface AttributeDef {
  name: string;
  description: string;
}

// Unified credential metadata interfaces following OCA principles
export interface SchemaMetadata {
  schemaId: string;
  schemaName: string;
  schemaVersion: string;
  attributes: AttributeDef[];
  constraints?: Record<string, any>;
}

export interface CryptographicMetadata {
  issuerDid: string;
  credDefId: string;
  revocationRegistryId?: string;
  governanceFramework?: string;
  trustRegistry?: string;
}

export interface BrandingMetadata {
  displayName: string;
  description: string;
  issuerName: string;
  issuerWebsite?: string;
  logo: {
    url: string;
    altText: string;
    dimensions?: { width: number; height: number; };
  };
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  backgroundImage?: {
    url: string;
    position: string;
  };
  layout: 'standard' | 'banner-top' | 'banner-bottom' | 'minimal';
  cardStyle?: Record<string, any>;
}

export interface EcosystemMetadata {
  ecosystem: string;
  interopProfile: string;
  compatibleWallets: string[];
  walletRestricted: boolean;
  ledgerNetwork: string;
}

export interface OrbitIntegration {
  orbitSchemaId?: number;
  orbitCredDefId?: number;
  importedAt?: Date;
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

// Legacy credential tables (to be migrated to unified structure)

// Orbit imported schemas table - stores external schemas imported into Orbit LOB
export const orbitSchemas = pgTable("orbit_schemas", {
  id: serial("id").primaryKey(),
  externalSchemaId: text("external_schema_id").notNull().unique(), // Original AnonCreds schema ID
  orbitSchemaId: integer("orbit_schema_id").notNull().unique(), // Numeric ID returned by Orbit
  schemaName: text("schema_name").notNull(),
  schemaVersion: text("schema_version").notNull(),
  issuerDid: text("issuer_did").notNull(),
  attributes: jsonb("attributes").$type<string[]>().notNull(),
  importedAt: timestamp("imported_at").defaultNow().notNull(),
});

// Orbit imported credential definitions table - stores external cred defs imported into Orbit LOB  
export const orbitCredentialDefinitions = pgTable("orbit_credential_definitions", {
  id: serial("id").primaryKey(),
  externalCredDefId: text("external_cred_def_id").notNull().unique(), // Original AnonCreds cred def ID
  orbitCredDefId: integer("orbit_cred_def_id").notNull().unique(), // Numeric ID returned by Orbit
  orbitSchemaId: integer("orbit_schema_id").notNull().references(() => orbitSchemas.orbitSchemaId),
  externalSchemaId: text("external_schema_id").notNull(),
  issuerDid: text("issuer_did").notNull(),
  tag: text("tag").default("default"),
  importedAt: timestamp("imported_at").defaultNow().notNull(),
});

// Unified credential metadata table following OCA principles
export const credentialTemplates = pgTable("credential_templates", {
  id: serial("id").primaryKey(),
  
  // Core Identity
  label: text("label").notNull().unique(),
  version: text("version").notNull(),
  
  // Schema Metadata (data structure)
  schemaMetadata: jsonb("schema_metadata").$type<SchemaMetadata>().notNull(),
  
  // Cryptographic Metadata (verification)
  cryptographicMetadata: jsonb("cryptographic_metadata").$type<CryptographicMetadata>().notNull(),
  
  // Branding/UX Metadata (presentation)
  brandingMetadata: jsonb("branding_metadata").$type<BrandingMetadata>().notNull(),
  
  // Ecosystem Metadata (interoperability)
  ecosystemMetadata: jsonb("ecosystem_metadata").$type<EcosystemMetadata>().notNull(),
  
  // Orbit Integration (external system mapping)
  orbitIntegration: jsonb("orbit_integration").$type<OrbitIntegration>(),
  
  // Administrative
  isPredefined: boolean("is_predefined").notNull().default(false),
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
  schemaMetadata: true,
  cryptographicMetadata: true,
  brandingMetadata: true,
  ecosystemMetadata: true,
  orbitIntegration: true,
  isPredefined: true,
  visible: true,
});

export const insertCredentialAttributeSchema = createInsertSchema(credentialAttributes).pick({
  templateId: true,
  name: true,
  description: true,
  pos: true,
});

export const insertOrbitSchemaSchema = createInsertSchema(orbitSchemas).pick({
  externalSchemaId: true,
  orbitSchemaId: true,
  schemaName: true,
  schemaVersion: true,
  issuerDid: true,
  attributes: true,
});

export const insertOrbitCredentialDefinitionSchema = createInsertSchema(orbitCredentialDefinitions).pick({
  externalCredDefId: true,
  orbitCredDefId: true,
  orbitSchemaId: true,
  externalSchemaId: true,
  issuerDid: true,
  tag: true,
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

export type OrbitSchema = typeof orbitSchemas.$inferSelect;
export type InsertOrbitSchema = z.infer<typeof insertOrbitSchemaSchema>;

export type OrbitCredentialDefinition = typeof orbitCredentialDefinitions.$inferSelect;
export type InsertOrbitCredentialDefinition = z.infer<typeof insertOrbitCredentialDefinitionSchema>;

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
