-- Mark existing database as baseline for migrations
-- This allows us to transition from push-based to migration-based workflow
-- without recreating existing tables

-- Create migrations metadata table if it doesn't exist
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
  "id" SERIAL PRIMARY KEY,
  "hash" text NOT NULL,
  "created_at" bigint
);

-- Insert baseline marker to indicate current schema is up-to-date
-- This prevents re-running the initial migration on existing databases
INSERT INTO "__drizzle_migrations" ("hash", "created_at") 
VALUES ('baseline_migration_' || extract(epoch from now())::text, extract(epoch from now())::bigint * 1000)
ON CONFLICT DO NOTHING;