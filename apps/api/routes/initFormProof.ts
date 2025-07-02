import { Request, Response } from 'express';
import { storage } from '../storage.js';
import { extractMappings, buildDefineProofPayload } from '../services/mappingExtractor.js';

export async function initFormProof(req: Request<{ formId: string }>, res: Response) {
  try {
    const formId = parseInt(req.params.formId);
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }

    // Get form from database
    const form = await storage.getFormConfig(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Extract VC mappings from form
    const mappings = extractMappings(form);
    if (mappings.length === 0) {
      return res.status(400).json({ error: 'No VC mappings found in form' });
    }

    // Build define-proof payload
    const definePayload = buildDefineProofPayload(form.name, mappings);

    // Get environment variables
    const ORBIT_API_KEY = process.env.ORBIT_API_KEY;
    const ORBIT_LOB_ID = process.env.ORBIT_LOB_ID;
    const ORBIT_BASE_URL = process.env.ORBIT_BASE_URL || 'https://devapi-verifier.nborbit.ca/';

    if (!ORBIT_API_KEY || !ORBIT_LOB_ID) {
      return res.status(500).json({ error: 'Orbit configuration missing' });
    }

    const headers = {
      'api-key': ORBIT_API_KEY,
      'lobId': ORBIT_LOB_ID,
      'Content-Type': 'application/json'
    };

    const baseUrl = `${ORBIT_BASE_URL}api/lob/${ORBIT_LOB_ID}`;

    // Step 1: Define proof request
    console.log('[ORBIT] Calling define-proof-request...');
    const defineResponse = await fetch(`${baseUrl}/define-proof-request`, {
      method: 'POST',
      headers,
      body: JSON.stringify(definePayload)
    });

    if (!defineResponse.ok) {
      const errorText = await defineResponse.text();
      console.error('[ORBIT] Define proof failed:', defineResponse.status, errorText);
      return res.status(500).json({ error: 'orbit-failed', step: 'define' });
    }

    const defineResult = await defineResponse.json();
    console.log('[ORBIT] define-proof-request status:', defineResponse.status, 'result:', defineResult);

    const proofDefineId = defineResult.data?.proofDefineId;
    if (!proofDefineId) {
      console.error('[ORBIT] No proofDefineId returned from define-proof');
      return res.status(500).json({ error: 'orbit-failed', step: 'define' });
    }

    // Step 2: Prepare URL for proof request
    console.log('[ORBIT] Calling proof/url...');
    const credProofId = crypto.randomUUID();
    const requestResponse = await fetch(`${baseUrl}/proof/url?connectionless=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        proofDefineId,
        messageProtocol: "AIP2_0",
        credProofId,
        proofAutoVerify: false,
        createClaim: false
      })
    });

    if (!requestResponse.ok) {
      const errorText = await requestResponse.text();
      console.error('[ORBIT] Proof request failed:', requestResponse.status, errorText);
      return res.status(500).json({ error: 'orbit-failed', step: 'request' });
    }

    const requestResult = await requestResponse.json();
    console.log('[ORBIT] proof/url status:', requestResponse.status, 'result:', requestResult);

    const { credProofId: returnedCredProofId, shortUrl, longUrl } = requestResult.data || {};
    if (!returnedCredProofId || !shortUrl) {
      console.error('[ORBIT] No credProofId or shortUrl returned from proof/url');
      return res.status(500).json({ error: 'orbit-failed', step: 'request' });
    }

    // Step 3: Generate QR code from shortUrl (skipping additional API calls since URL is already provided)
    console.log('[ORBIT] Generating QR code from shortUrl...');
    
    // For now, we'll use the shortUrl as the invitation URL and create a simple SVG placeholder
    // In a real implementation, you'd generate a proper QR code
    const qrSvg = `<svg width="250" height="250" xmlns="http://www.w3.org/2000/svg">
      <rect width="250" height="250" fill="white"/>
      <text x="125" y="125" text-anchor="middle" fill="black" font-size="12">QR Code for ${shortUrl}</text>
    </svg>`;

    // Return complete proof initialization data
    console.log('[ORBIT] Successfully completed proof initialization');
    res.json({
      proofId: returnedCredProofId,
      invitationUrl: shortUrl,
      svg: qrSvg
    });

  } catch (error) {
    console.error('[ORBIT] Exception in initFormProof:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}