CREATE TABLE "orbit_credential_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_cred_def_id" text NOT NULL,
	"orbit_cred_def_id" integer NOT NULL,
	"orbit_schema_id" integer NOT NULL,
	"external_schema_id" text NOT NULL,
	"issuer_did" text NOT NULL,
	"tag" text DEFAULT 'default',
	"imported_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orbit_credential_definitions_external_cred_def_id_unique" UNIQUE("external_cred_def_id"),
	CONSTRAINT "orbit_credential_definitions_orbit_cred_def_id_unique" UNIQUE("orbit_cred_def_id")
);
--> statement-breakpoint
CREATE TABLE "orbit_schemas" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_schema_id" text NOT NULL,
	"orbit_schema_id" integer NOT NULL,
	"schema_name" text NOT NULL,
	"schema_version" text NOT NULL,
	"issuer_did" text NOT NULL,
	"attributes" jsonb NOT NULL,
	"imported_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orbit_schemas_external_schema_id_unique" UNIQUE("external_schema_id"),
	CONSTRAINT "orbit_schemas_orbit_schema_id_unique" UNIQUE("orbit_schema_id")
);
--> statement-breakpoint
ALTER TABLE "credential_templates" DROP CONSTRAINT "credential_templates_label_key";--> statement-breakpoint
DROP INDEX "idx_credential_attributes_template_id";--> statement-breakpoint
DROP INDEX "form_configs_published_slug_idx";--> statement-breakpoint
ALTER TABLE "credential_attributes" ALTER COLUMN "template_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orbit_credential_definitions" ADD CONSTRAINT "orbit_credential_definitions_orbit_schema_id_orbit_schemas_orbit_schema_id_fk" FOREIGN KEY ("orbit_schema_id") REFERENCES "public"."orbit_schemas"("orbit_schema_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_attributes" ADD CONSTRAINT "credential_attributes_template_id_credential_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."credential_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "form_configs_published_slug_idx" ON "form_configs" USING btree ("is_published","public_slug");--> statement-breakpoint
ALTER TABLE "credential_templates" ADD CONSTRAINT "credential_templates_label_unique" UNIQUE("label");