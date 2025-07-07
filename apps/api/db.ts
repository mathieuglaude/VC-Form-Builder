import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../packages/shared/schema";
import { dbConfig } from '../../packages/shared/src/config';

neonConfig.webSocketConstructor = ws;

if (!dbConfig.url) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: dbConfig.url });
export const db = drizzle({ client: pool, schema });
