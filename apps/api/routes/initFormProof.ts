import { Request, Response } from 'express';
import { storage } from '../storage.js';
import { extractMappings, buildDefineProofPayload } from '../services/mappingExtractor.js';
import { ProofInitResponseSchema, type ProofInitResponse } from '../../../packages/shared/src/types/proof.js';
import { VerifierService } from '../../../packages/external/orbit/VerifierService.js';

export async function initFormProof(req: Request<{ formId: string }>, res: Response) {
  try {
    const formId = parseInt(req.params.formId);
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }

    const form = await storage.getFormConfig(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const mappings = extractMappings(form);
    if (mappings.length === 0) {
      return res.status(400).json({ error: 'No VC mappings found in form' });
    }

    const { ORBIT_API_KEY, ORBIT_LOB_ID, ORBIT_BASE_URL = 'https://devapi-verifier.nborbit.ca/' } = process.env;
    if (!ORBIT_API_KEY || !ORBIT_LOB_ID) {
      return res.status(500).json({ error: 'Orbit configuration missing' });
    }

    const verifier = new VerifierService(ORBIT_API_KEY, ORBIT_LOB_ID, ORBIT_BASE_URL);
    const definePayload = buildDefineProofPayload(form.name, mappings);

    try {
      const { proofDefineId } = await verifier.defineProof(definePayload);
      const { shortUrl } = await verifier.createProofUrl({ proofDefineId });
      
      res.json(ProofInitResponseSchema.parse({
        proofId: crypto.randomUUID(),
        invitationUrl: shortUrl,
        svg: verifier.generateQrSvg(shortUrl),
        status: 'ok'
      }));

    } catch (orbitError: any) {
      const mockProofDefineId = Date.now();
      
      res.json(ProofInitResponseSchema.parse({
        proofId: crypto.randomUUID(),
        invitationUrl: verifier.getFallbackUrl(mockProofDefineId),
        svg: verifier.generateFallbackQrSvg(mockProofDefineId),
        status: 'fallback',
        error: orbitError.message
      }));
    }

  } catch (error: any) {
    console.error('[ORBIT] Exception in initFormProof:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}