import { Request, Response } from 'express';
import { storage } from '../storage.js';
import { extractMappings, buildDefineProofPayload } from '../services/mappingExtractor.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const QRCode = require('qrcode-svg');

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
      'Content-Type': 'application/json',
      'Accept': '*/*'
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
    const proofUrlPayload = { 
      proofDefineId,
      messageProtocol: "AIP2_0",
      credProofId,
      proofAutoVerify: false,
      createClaim: false
    };
    console.log('[ORBIT] Proof URL payload:', JSON.stringify(proofUrlPayload, null, 2));
    
    const requestResponse = await fetch(`${baseUrl}/proof/url?connectionless=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(proofUrlPayload)
    });

    if (!requestResponse.ok) {
      const errorText = await requestResponse.text();
      console.error('[ORBIT] Proof request failed:', requestResponse.status, errorText);
      
      // Since proof/url is failing but define-proof works, generate a fallback QR code
      // for testing purposes using the proofDefineId
      console.log('[ORBIT] Generating fallback QR code due to proof/url failure...');
      
      const fallbackUrl = `https://devapi-verifier.nborbit.ca/api/lob/${ORBIT_LOB_ID}/proof-request/${proofDefineId}`;
      const qr = new QRCode({
        content: fallbackUrl,
        width: 250,
        height: 250,
        color: "#000000", 
        background: "#ffffff",
        ecl: "M"
      });
      
      const qrSvg = qr.svg();
      
      console.log('[ORBIT] Fallback QR generated for proofDefineId:', proofDefineId);
      return res.json({
        proofId: credProofId,
        invitationUrl: fallbackUrl,
        svg: qrSvg,
        status: 'fallback', // Indicate this is a fallback response
        error: `Orbit proof/url failed: ${errorText}`
      });
    }

    const requestResult = await requestResponse.json();
    console.log('[ORBIT] proof/url status:', requestResponse.status);
    console.log('[ORBIT] Full response from POST /proof/url:', JSON.stringify(requestResult, null, 2));

    const { credProofId: returnedCredProofId, shortUrl, longUrl } = requestResult.data || {};
    if (!returnedCredProofId || !shortUrl) {
      console.error('[ORBIT] No credProofId or shortUrl returned from proof/url');
      
      // Generate fallback QR code even when response format is unexpected
      const fallbackUrl = `https://devapi-verifier.nborbit.ca/api/lob/${ORBIT_LOB_ID}/proof-request/${proofDefineId}`;
      const qr = new QRCode({
        content: fallbackUrl,
        width: 250,
        height: 250,
        color: "#000000",
        background: "#ffffff", 
        ecl: "M"
      });
      
      const qrSvg = qr.svg();
      
      return res.json({
        proofId: credProofId,
        invitationUrl: fallbackUrl,
        svg: qrSvg,
        status: 'fallback',
        error: 'No shortUrl in response'
      });
    }

    // Step 3: Generate QR code from shortUrl
    console.log('[ORBIT] Generating QR code from shortUrl:', shortUrl);
    
    // Generate proper QR code SVG using same library as proofs.ts
    const qr = new QRCode({
      content: shortUrl,
      width: 250,
      height: 250,
      color: "#000000",
      background: "#ffffff",
      ecl: "M"
    });
    
    const qrSvg = qr.svg();

    // Return complete proof initialization data
    console.log('[ORBIT] Successfully completed proof initialization');
    res.json({
      proofId: returnedCredProofId,
      invitationUrl: shortUrl,
      svg: qrSvg,
      status: 'success'
    });

  } catch (error) {
    console.error('[ORBIT] Exception in initFormProof:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}