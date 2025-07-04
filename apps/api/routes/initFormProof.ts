import { Request, Response } from 'express';
import { storage } from '../storage.js';
import { extractMappings, buildDefinePayload, extractInvitationUrl } from '../../../packages/shared/src/proof.js';
import { ProofInitResponseSchema, type ProofInitResponse } from '../../../packages/shared/src/types/proof.js';
import { VerifierService } from '../../../packages/external/orbit/VerifierService.js';
// import { CredentialImportService } from '../services/credentialImportService.js';
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

    const { ORBIT_API_KEY, ORBIT_LOB_ID, ORBIT_VERIFIER_BASE_URL = 'https://testapi-verifier.nborbit.ca/' } = process.env;
    if (!ORBIT_API_KEY || !ORBIT_LOB_ID) {
      return res.status(500).json({ error: 'Orbit configuration missing' });
    }

    // Step 2: Build proof request payload (to be enhanced with auto-import)
    // TODO: Implement auto-import of external credentials into Orbit LOB
    const orbitMappings = new Map(); // Will contain numeric Orbit IDs after import
    
    const definePayload = buildDefinePayload(mappings, form.name, orbitMappings);
    console.log('[DEFINE-PAYLOAD]', JSON.stringify(definePayload, null, 2));
    
    if (!definePayload) {
      return res.json({ status: 'no-vc', message: 'Unable to build proof request from mappings' });
    }

    const verifier = new VerifierService(ORBIT_API_KEY, ORBIT_LOB_ID, ORBIT_VERIFIER_BASE_URL);

    // Step 3: Pass complete payload to VerifierService for direct endpoint transformation
    const orbitPayload = definePayload;

    try {
      console.info('[ORBIT ➡] Calling direct proof-request/url endpoint');
      const urlResponse = await verifier.createDirectProofUrl(orbitPayload);
      console.info('[ORBIT ⬅] proof-request/url response', urlResponse);
      
      // Extract wallet-friendly invitation URL from response
      const invitationUrl = extractInvitationUrl(urlResponse);
      console.info('[QR-DEBUG] extracted invitationUrl', invitationUrl?.slice(0, 120));
      console.info('[QR-DEBUG] QR_VALIDATE env var:', !!process.env.QR_VALIDATE);
      console.info('[QR-DEBUG] invitationUrl exists:', !!invitationUrl);
      
      // Ensure we have a valid invitation URL
      if (!invitationUrl) {
        throw new Error('No invitation URL could be extracted from Orbit response');
      }

      // Optional validation behind environment flag
      if (process.env.QR_VALIDATE && (!invitationUrl.startsWith('didcomm://') && !invitationUrl.startsWith('https://'))) {
        console.error('[QR-INVALID] Invalid invitation URL format:', invitationUrl);
        return res.status(502).json({ 
          status: 'invalid-invitation',
          error: 'Invalid invitation URL format received from Orbit'
        });
      }
      
      res.json(ProofInitResponseSchema.parse({
        proofId: crypto.randomUUID(),
        invitationUrl: invitationUrl,
        svg: verifier.generateQrSvg(invitationUrl),
        status: 'ok'
      }));

    } catch (orbitError: any) {
      console.error('[ORBIT-ERROR] Direct proof-request/url failed:', orbitError.constructor.name, ':', orbitError.message);
      
      // Since we're only using direct endpoint, return error response
      return res.status(500).json({ 
        error: 'Proof request failed', 
        details: orbitError.message,
        reason: 'Direct endpoint requires registered credentials in Orbit LOB'
      });
    }

  } catch (error: any) {
    console.error('[ORBIT] Exception in initFormProof:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}