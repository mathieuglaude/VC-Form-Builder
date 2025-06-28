import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const formConfigs = pgTable("form_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // Form name (required, unique)
  slug: text("slug").notNull().unique(), // URL-safe slug
  purpose: text("purpose").notNull(), // Short description
  logoUrl: text("logo_url"), // Logo file path or URL
  title: text("title").notNull(), // Kept for backward compatibility
  description: text("description"),
  formSchema: jsonb("form_schema").notNull(), // Form.io JSON schema
  metadata: jsonb("metadata").notNull(), // Extended metadata for VC integration
  proofRequests: jsonb("proof_requests").default([]), // VC proof requirements
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FormConfig = typeof formConfigs.$inferSelect;
export type InsertFormConfig = z.infer<typeof insertFormConfigSchema>;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;

export type CredentialDefinition = typeof credentialDefinitions.$inferSelect;
export type InsertCredentialDefinition = z.infer<typeof insertCredentialDefinitionSchema>;

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
