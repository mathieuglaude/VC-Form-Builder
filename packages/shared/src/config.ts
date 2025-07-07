import { z } from 'zod';

/**
 * Canonical environment variable schema for VC Form Builder
 * Phase 6-A: Central configuration with Zod validation
 */
const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Server Configuration
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // VC Feature Flags
  ENABLE_VC: z.string().default('false'), // Backend VC functionality
  VITE_ENABLE_VC: z.string().default('false'), // Frontend VC functionality
  
  // Orbit Enterprise API Configuration
  ORBIT_API_KEY: z.string().optional(),
  ORBIT_BASE: z.string().url().optional(),
  ORBIT_VERIFIER_BASE_URL: z.string().url().default('https://testapi-verifier.nborbit.ca'),
  ORBIT_LOB_ID: z.string().optional(),
  ORBIT_USE_REAL: z.string().default('false'),
  
  // Orbit WebSocket Configuration
  ORBIT_WS_URL: z.string().url().optional(),
  ORBIT_TRANSACTION_ID: z.string().optional(),
  
  // Legacy VC API Configuration (deprecated)
  VC_API_BASE_URL: z.string().url().optional(),
  VC_API_KEY: z.string().optional(),
  VITE_VC_API_BASE_URL: z.string().url().optional(), 
  VITE_VC_API_KEY: z.string().optional(),
  
  // External Auth Provider Configuration
  AUTH_BASE: z.string().url().optional(),
  AUTH_API_KEY: z.string().optional(),
  
  // Development/Testing Configuration
  QR_VALIDATE: z.string().optional(),
  VITE_DEV_OWNER_BYPASS: z.string().default('false'),
  REPL_ID: z.string().optional(),
  
  // Orbit LOB Registration Configuration
  LOB_DISPLAY_NAME: z.string().optional(),
  LOB_EMAIL: z.string().email().optional(),
  LOB_ORG_NAME: z.string().optional(),
  LOB_ROLE: z.enum(['ISSUER', 'VERIFIER', 'BOTH']).optional(),
  LOB_TENANCY: z.enum(['SINGLE', 'MULTI']).optional(),
  LOB_DID_METHOD: z.enum(['did:sov', 'did:web']).optional(),
  LOB_PROTOCOL: z.enum(['AIP1_0', 'AIP2_0']).optional(),
  WRITE_LEDGER_ID: z.string().optional(),
  CRED_FORMAT: z.enum(['ANONCREDS', 'W3C']).optional(),
  
  // Optional Orbit Configuration
  LOB_TRUST_URL: z.string().url().optional(),
  LOB_TRUST_API_KEY: z.string().optional(),
  LOB_EXTERNAL_ENDORSER: z.string().optional(),
  ENDORSER_DID: z.string().optional(),
  ENDORSER_NAME: z.string().optional(),
  
  // Legacy Database Configuration (auto-managed by Replit)
  PGDATABASE: z.string().optional(),
  PGHOST: z.string().optional(), 
  PGPASSWORD: z.string().optional(),
  PGPORT: z.string().optional(),
  PGUSER: z.string().optional(),
  
  // Session Configuration
  SESSION_SECRET: z.string().optional(),
});

/**
 * Parse and validate environment variables
 */
export const config = envSchema.parse(process.env);

/**
 * Derived feature flags from environment configuration
 */
export const featureFlags = {
  // VC feature flag: true if ENABLE_VC is explicitly set to 'true'
  vc: config.ENABLE_VC === 'true',
  
  // Development flags
  devOwnerBypass: config.VITE_DEV_OWNER_BYPASS === 'true',
  qrValidation: config.QR_VALIDATE === 'true',
  
  // Orbit integration flags
  useRealOrbit: config.ORBIT_USE_REAL === 'true',
  externalEndorser: config.LOB_EXTERNAL_ENDORSER === 'true',
} as const;

/**
 * Orbit Enterprise configuration object
 */
export const orbitConfig = {
  baseUrl: config.ORBIT_VERIFIER_BASE_URL,
  lobId: config.ORBIT_LOB_ID,
  apiKey: config.ORBIT_API_KEY,
  wsUrl: config.ORBIT_WS_URL,
  useReal: featureFlags.useRealOrbit,
} as const;

/**
 * Database configuration
 */
export const dbConfig = {
  url: config.DATABASE_URL,
  // Legacy PostgreSQL connection details (if needed)
  pg: {
    database: config.PGDATABASE,
    host: config.PGHOST,
    password: config.PGPASSWORD,
    port: config.PGPORT ? parseInt(config.PGPORT) : undefined,
    user: config.PGUSER,
  },
} as const;

/**
 * Server configuration
 */
export const serverConfig = {
  port: parseInt(config.PORT),
  nodeEnv: config.NODE_ENV,
  sessionSecret: config.SESSION_SECRET,
} as const;

/**
 * Export types for TypeScript inference
 */
export type Config = typeof config;
export type FeatureFlags = typeof featureFlags;
export type OrbitConfig = typeof orbitConfig;
export type DbConfig = typeof dbConfig;
export type ServerConfig = typeof serverConfig;