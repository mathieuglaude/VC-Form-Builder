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
  title: text("title").notNull(),
  description: text("description"),
  formSchema: jsonb("form_schema").notNull(), // Form.io JSON schema
  metadata: jsonb("metadata").notNull(), // Extended metadata for VC integration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formConfigId: integer("form_config_id").notNull().references(() => formConfigs.id),
  submissionData: jsonb("submission_data").notNull(),
  verifiedFields: jsonb("verified_fields"), // Fields that were verified via VC
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
  title: true,
  description: true,
  formSchema: true,
  metadata: true,
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
