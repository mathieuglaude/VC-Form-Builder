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

    const { proofDefinitionId } = defineResult;
    if (!proofDefinitionId) {
      console.error('[ORBIT] No proofDefinitionId returned from define-proof');
      return res.status(500).json({ error: 'orbit-failed', step: 'define' });
    }

    // Step 2: Create proof request
    console.log('[ORBIT] Calling proof-requests...');
    const requestResponse = await fetch(`${baseUrl}/proof-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ proofDefinitionId })
    });

    if (!requestResponse.ok) {
      const errorText = await requestResponse.text();
      console.error('[ORBIT] Proof request failed:', requestResponse.status, errorText);
      return res.status(500).json({ error: 'orbit-failed', step: 'request' });
    }

    const requestResult = await requestResponse.json();
    console.log('[ORBIT] proof-requests status:', requestResponse.status, 'result:', requestResult);

    const { proofId } = requestResult;
    if (!proofId) {
      console.error('[ORBIT] No proofId returned from proof-requests');
      return res.status(500).json({ error: 'orbit-failed', step: 'request' });
    }

    // Step 3: Get invitation URL
    console.log('[ORBIT] Getting invitation URL...');
    const urlResponse = await fetch(`${baseUrl}/${proofId}/url`, {
      method: 'GET',
      headers
    });

    if (!urlResponse.ok) {
      const errorText = await urlResponse.text();
      console.error('[ORBIT] URL fetch failed:', urlResponse.status, errorText);
      return res.status(500).json({ error: 'orbit-failed', step: 'url' });
    }

    const urlResult = await urlResponse.json();
    console.log('[ORBIT] URL status:', urlResponse.status, 'result:', urlResult);

    const { invitationUrl } = urlResult;
    if (!invitationUrl) {
      console.error('[ORBIT] No invitationUrl returned');
      return res.status(500).json({ error: 'orbit-failed', step: 'url' });
    }

    // Step 4: Get QR code SVG
    console.log('[ORBIT] Getting QR code...');
    const qrResponse = await fetch(`${baseUrl}/${proofId}/qr`, {
      method: 'GET',
      headers
    });

    if (!qrResponse.ok) {
      const errorText = await qrResponse.text();
      console.error('[ORBIT] QR fetch failed:', qrResponse.status, errorText);
      return res.status(500).json({ error: 'orbit-failed', step: 'qr' });
    }

    const qrResult = await qrResponse.json();
    console.log('[ORBIT] QR status:', qrResponse.status, 'result keys:', Object.keys(qrResult));

    const { svg } = qrResult;
    if (!svg) {
      console.error('[ORBIT] No SVG returned from QR endpoint');
      return res.status(500).json({ error: 'orbit-failed', step: 'qr' });
    }

    // Return complete proof initialization data
    res.json({
      proofId,
      invitationUrl,
      svg
    });

  } catch (error) {
    console.error('[ORBIT] Exception in initFormProof:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}