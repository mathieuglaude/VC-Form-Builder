import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Simple .env file loader
function loadEnvFile() {
  try {
    // Try both root .env and API-specific .env
    const envPaths = [
      path.resolve('.env'),
      path.resolve(process.cwd(), '.env')
    ];
    
    for (const envPath of envPaths) {
      try {
        const envFile = fs.readFileSync(envPath, 'utf8');
        console.log('Loading env from:', envPath);
        
        for (const line of envFile.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
              const value = valueParts.join('=');
              if (!process.env[key]) { // Don't override existing env vars
                process.env[key] = value;
              }
            }
          }
        }
      } catch (err) {
        // Continue to next path
      }
    }
  } catch (error) {
    console.warn('Could not load .env file:', error);
  }
}

// Load environment variables from .env file
loadEnvFile();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  ORBIT_BASE: z.string().url(),
  ORBIT_API_KEY: z.string(),
  ORBIT_VERIFIER_BASE_URL: z.string().url().default('https://testapi-verifier.nborbit.ca'),
  ORBIT_LOB_ID: z.string(),
  VERIFIER_BASE: z.string().url().default('https://testapi-verifier.nborbit.ca'),
  VERIFIER_API_KEY: z.string().default('demo-key'),
  ORBIT_USE_REAL: z.string().default('false')
});

export const env = envSchema.parse(process.env);

// Export orbit configuration for the VerifierClient
export const orbit = {
  base: env.ORBIT_VERIFIER_BASE_URL,
  lobId: env.ORBIT_LOB_ID,
  apiKey: env.ORBIT_API_KEY,
  useRealOrbit: env.ORBIT_USE_REAL === 'true'
};

// Log environment validation on startup
console.log('[env] Environment configuration loaded:', {
  port: env.PORT,
  orbitBase: env.ORBIT_VERIFIER_BASE_URL,
  orbitLobId: env.ORBIT_LOB_ID,
  hasApiKey: !!env.ORBIT_API_KEY
});