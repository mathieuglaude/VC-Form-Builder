/**
 * Production-safe migration runner
 * Runs Drizzle migrations with proper error handling and logging
 */

import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Configure WebSocket for serverless environment
neonConfig.webSocketConstructor = ws;

// Import config using CommonJS require for Node.js script
const { dbConfig } = require('../shared/dist/config.js');

if (!dbConfig.url) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function runMigrations() {
  const pool = new Pool({ connectionString: dbConfig.url });
  const db = drizzle({ client: pool });

  try {
    console.log('🔄 Running database migrations...');
    
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();