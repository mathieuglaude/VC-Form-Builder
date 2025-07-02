import { z } from 'zod';

export const ProofInitResponseSchema = z.object({
  proofId: z.string(),
  svg: z.string(),
  invitationUrl: z.string(),
  status: z.enum(['ok', 'fallback']),
  error: z.string().optional()
});

export type ProofInitResponse = z.infer<typeof ProofInitResponseSchema>;