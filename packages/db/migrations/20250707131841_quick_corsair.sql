-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "credential_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"credential_type" text NOT NULL,
	"issuer_did" text,
	"attributes" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"form_schema" jsonb NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"purpose" text NOT NULL,
	"logo_url" text,
	"proof_requests" jsonb DEFAULT '[]'::jsonb,
	"revocation_policies" jsonb DEFAULT '{}'::jsonb,
	"is_public" boolean DEFAULT false NOT NULL,
	"author_id" text DEFAULT 'demo' NOT NULL,
	"author_name" text DEFAULT 'Demo User' NOT NULL,
	"author_org" text,
	"cloned_from" integer,
	"proof_def" jsonb,
	"proof_def_id" text,
	"is_template" boolean DEFAULT true NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"public_slug" text,
	"proof_transport" text,
	"published_at" timestamp,
	CONSTRAINT "form_configs_name_unique" UNIQUE("name"),
	CONSTRAINT "form_configs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_config_id" integer NOT NULL,
	"submission_data" jsonb NOT NULL,
	"verified_fields" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "credential_attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"pos" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credential_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"version" text NOT NULL,
	"schema_metadata" jsonb NOT NULL,
	"cryptographic_metadata" jsonb NOT NULL,
	"branding_metadata" jsonb NOT NULL,
	"ecosystem_metadata" jsonb NOT NULL,
	"orbit_integration" jsonb,
	"is_predefined" boolean DEFAULT false NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credential_templates_label_key" UNIQUE("label")
);
--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_config_id_form_configs_id_fk" FOREIGN KEY ("form_config_id") REFERENCES "public"."form_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "form_configs_published_slug_idx" ON "form_configs" USING btree ("is_published" text_ops,"public_slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_credential_attributes_template_id" ON "credential_attributes" USING btree ("template_id" int4_ops);
*/