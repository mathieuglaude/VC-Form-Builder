import { Request, Response } from 'express';
import { storage } from '../storage.js';
import { extractMappings, buildDefinePayload } from '../../../packages/shared/src/proof.js';
import { ProofInitResponseSchema, type ProofInitResponse } from '../../../packages/shared/src/types/proof.js';
import { VerifierService } from '../../../packages/external/orbit/VerifierService.js';
import crypto from 'crypto';

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

    // Step 1: Extract VC mappings from form schema
    const mappings = extractMappings(form.formSchema as any);
    console.log('[MAPPINGS]', JSON.stringify(mappings, null, 2));
    
    if (mappings.length === 0) {
      return res.json({ status: 'no-vc', message: 'No verifiable credential fields found' });
    }

    // Step 2: Build Orbit proof request payload
    const definePayload = buildDefinePayload(mappings, form.name);
    console.log('[DEFINE-PAYLOAD]', JSON.stringify(definePayload, null, 2));
    
    if (!definePayload) {
      return res.json({ status: 'no-vc', message: 'Unable to build proof request from mappings' });
    }

    const { ORBIT_API_KEY, ORBIT_LOB_ID, ORBIT_BASE_URL = 'https://devapi-verifier.nborbit.ca/' } = process.env;
    if (!ORBIT_API_KEY || !ORBIT_LOB_ID) {
      return res.status(500).json({ error: 'Orbit configuration missing' });
    }

    const verifier = new VerifierService(ORBIT_API_KEY, ORBIT_LOB_ID, ORBIT_BASE_URL);

    // Step 3: Convert to Orbit-compatible format (simplified attributes structure)
    const orbitPayload = {
      proofName: definePayload.proofName,
      proofPurpose: definePayload.proofPurpose,
      proofCredFormat: definePayload.proofCredFormat,
      requestedAttributes: definePayload.requestedAttributes.map(attr => ({
        attributes: [attr.name]
      })),
      requestedPredicates: definePayload.requestedPredicates
    } as any;

    try {
      const { proofDefineId } = await verifier.defineProof(orbitPayload);
      const urlResponse = await verifier.createProofUrl({ proofDefineId });
      console.info('[ORBIT ⬅] prepare-url response', urlResponse);
      const { shortUrl } = urlResponse;
      console.info('[QR-DEBUG] invitationUrl', shortUrl?.slice(0, 120));
      
      // Validate invitation URL format
      if (!shortUrl || (!shortUrl.startsWith('didcomm://') && !shortUrl.startsWith('https://'))) {
        console.error('[QR-INVALID] Invalid invitation URL format:', shortUrl);
        return res.status(502).json({ 
          status: 'invalid-invitation',
          error: 'Invalid invitation URL format received from Orbit'
        });
      }
      
      res.json(ProofInitResponseSchema.parse({
        proofId: crypto.randomUUID(),
        invitationUrl: shortUrl,
        svg: verifier.generateQrSvg(shortUrl),
        status: 'ok'
      }));

    } catch (orbitError: any) {
      console.error('[ORBIT-ERROR]', orbitError.constructor.name, ':', orbitError.message);
      const mockProofDefineId = Date.now();
      const fallbackUrl = verifier.getFallbackUrl(mockProofDefineId);
      
      console.info('[QR-DEBUG] fallback invitationUrl', fallbackUrl?.slice(0, 120));
      
      // Return error response instead of invalid QR for fallback URLs
      return res.status(502).json({ 
        status: 'orbit-error',
        error: `Orbit API error: ${orbitError.message}`,
        warning: 'Orbit Enterprise is currently unavailable'
      });
    }

  } catch (error: any) {
    console.error('[ORBIT] Exception in initFormProof:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}