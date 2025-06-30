import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Simple .env file loader
function loadEnvFile() {
  try {
    const envPath = path.resolve('.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
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
  VERIFIER_BASE: z.string().url().default('https://testapi-verifier.nborbit.ca'),
  VERIFIER_API_KEY: z.string().default('demo-key')
});

export const env = envSchema.parse(process.env);