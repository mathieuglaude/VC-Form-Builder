import { pgTable, serial, text, jsonb, timestamp, index, unique, boolean, integer, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const credentialDefinitions = pgTable("credential_definitions", {
	id: serial().primaryKey().notNull(),
	credentialType: text("credential_type").notNull(),
	issuerDid: text("issuer_did"),
	attributes: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const formConfigs = pgTable("form_configs", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	formSchema: jsonb("form_schema").notNull(),
	metadata: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	purpose: text().notNull(),
	logoUrl: text("logo_url"),
	proofRequests: jsonb("proof_requests").default([]),
	revocationPolicies: jsonb("revocation_policies").default({}),
	isPublic: boolean("is_public").default(false).notNull(),
	authorId: text("author_id").default('demo').notNull(),
	authorName: text("author_name").default('Demo User').notNull(),
	authorOrg: text("author_org"),
	clonedFrom: integer("cloned_from"),
	proofDef: jsonb("proof_def"),
	proofDefId: text("proof_def_id"),
	isTemplate: boolean("is_template").default(true).notNull(),
	isPublished: boolean("is_published").default(false).notNull(),
	publicSlug: text("public_slug"),
	proofTransport: text("proof_transport"),
	publishedAt: timestamp("published_at", { mode: 'string' }),
}, (table) => [
	index("form_configs_published_slug_idx").using("btree", table.isPublished.asc().nullsLast().op("text_ops"), table.publicSlug.asc().nullsLast().op("text_ops")),
	unique("form_configs_name_unique").on(table.name),
	unique("form_configs_slug_unique").on(table.slug),
]);

export const formSubmissions = pgTable("form_submissions", {
	id: serial().primaryKey().notNull(),
	formConfigId: integer("form_config_id").notNull(),
	submissionData: jsonb("submission_data").notNull(),
	verifiedFields: jsonb("verified_fields").default(null),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.formConfigId],
			foreignColumns: [formConfigs.id],
			name: "form_submissions_form_config_id_form_configs_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	role: text().default('user').notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const credentialAttributes = pgTable("credential_attributes", {
	id: serial().primaryKey().notNull(),
	templateId: integer("template_id"),
	name: text().notNull(),
	description: text().default('),
	pos: integer().default(0).notNull(),
}, (table) => [
	index("idx_credential_attributes_template_id").using("btree", table.templateId.asc().nullsLast().op("int4_ops")),
]);

export const credentialTemplates = pgTable("credential_templates", {
	id: serial().primaryKey().notNull(),
	label: text().notNull(),
	version: text().notNull(),
	schemaMetadata: jsonb("schema_metadata").notNull(),
	cryptographicMetadata: jsonb("cryptographic_metadata").notNull(),
	brandingMetadata: jsonb("branding_metadata").notNull(),
	ecosystemMetadata: jsonb("ecosystem_metadata").notNull(),
	orbitIntegration: jsonb("orbit_integration"),
	isPredefined: boolean("is_predefined").default(false).notNull(),
	visible: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("credential_templates_label_key").on(table.label),
]);
