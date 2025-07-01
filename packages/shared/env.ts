import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  VITE_VC_API_BASE_URL: z.string().url().optional(),
  VITE_VC_API_KEY: z.string().optional(),
  VC_API_BASE_URL: z.string().url().optional(),
  VC_API_KEY: z.string().optional(),
  ORBIT_API_KEY: z.string().optional(),
  ORBIT_BASE_URL: z.string().url().optional(),
  
  // External Auth provider configuration
  AUTH_BASE: z.string().url().optional(),      // e.g. https://auth.myorg.com
  AUTH_API_KEY: z.string().optional()          // if your IdP uses x-api-key
});

export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
export const env = envSchema.parse(process.env);