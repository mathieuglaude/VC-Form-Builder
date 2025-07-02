import { Router, Request, Response } from 'express';
import { orbit } from '../src/config';
import { ProofInitResponseSchema, type ProofInitResponse } from '../../../packages/shared/src/types/proof.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const QRCode = require('qrcode-svg');

const router = Router();

// In-memory cache for QR codes (5-minute expiration)
const qrCache = new Map<string, { svg: string; expiry: number }>();

// POST /proofs/init - Initialize proof request
router.post('/proofs/init', async (req, res) => {
  try {
    const { formId, publicSlug } = req.body;
    
    if (!formId && !publicSlug) {
      return res.status(400).json({ error: 'formId or publicSlug is required' });
    }

    const identifier = formId || publicSlug;
    console.log(`[POST /init] Starting proof initialization for: ${formId ? `form ${formId}` : `slug ${publicSlug}`}`);

    if (!orbit.useRealOrbit) {
      // Mock response when Orbit integration is disabled
      const mockProofId = `mock_${Date.now()}`;
      console.log(`[POST /init] Using mock proof ID: ${mockProofId}`);
      return res.status(201).json({ proofId: mockProofId });
    }

    // Real Orbit integration - create proof request
    try {
      const proofResponse = await fetch(`${orbit.baseUrl}api/lob/${orbit.lobId}/proof-requests`, {
        method: 'POST',
        headers: {
          'api-key': orbit.apiKey,
          'lobId': orbit.lobId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Form ${identifier} Verification`,
          version: '1.0',
          requestedAttributes: [
            {
              name: 'given_name',
              restrictions: [{
                cred_def_id: 'QzLYGuAebsy3MXQ6b1sFiT:3:CL:20:default'
              }]
            }
          ]
        })
      });

      const responseText = await proofResponse.text();
      console.log('[ORBIT-DEBUG] status', proofResponse.status, responseText);

      if (!proofResponse.ok) {
        throw new Error(`Orbit proof request failed: ${proofResponse.status} ${proofResponse.statusText}`);
      }

      const proofData = JSON.parse(responseText);
      const orbitProofId = proofData.id || proofData.proofId || proofData.txId;
      
      console.log('[INIT-DEBUG] Orbit proof id', orbitProofId);
      res.status(201).json({ proofId: orbitProofId });

    } catch (error: any) {
      console.error('[POST /init] Orbit API error:', error.message);
      throw error;
    }

  } catch (error: any) {
    console.error('[POST /init] Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /proofs/:id/qr - Generate QR code for proof request
router.get('/proofs/:id/qr', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Proof ID is required' });
    }

    console.log(`[GET /qr] Generating QR code for proof: ${id}`);

    // Check cache first
    const cached = qrCache.get(id);
    if (cached && Date.now() < cached.expiry) {
      console.log(`[GET /qr] Using cached QR for: ${id}`);
      const invitationUrl = orbit.useRealOrbit ? `https://example.org/mock/${id}` : `https://example.org/mock/${id}`;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ svg: cached.svg, invitationUrl });
    }

    let invitationUrl: string;

    if (orbit.useRealOrbit) {
      // Call Orbit "Prepare URL for Proof Request" API
      try {
        const prepareResponse = await fetch(`${orbit.baseUrl}/api/lob/${orbit.lobId}/proof-request/url`, {
          method: 'POST',
          headers: {
            'api-key': orbit.apiKey,
            'lobId': orbit.lobId,
            'Content-Type': 'application/json'
          }
        });

        if (!prepareResponse.ok) {
          console.error('[QR-ERROR]', prepareResponse.status, await prepareResponse.text());
          throw new Error(`Orbit prepare-url failed: ${prepareResponse.status} ${prepareResponse.statusText}`);
        }

        const prepareData = await prepareResponse.json();
        invitationUrl = prepareData.invitationUrl;
        console.log(`[GET /qr] Got real Orbit invitation URL: ${invitationUrl}`);
      } catch (error: any) {
        console.error(`[GET /qr] Orbit prepare-url error:`, error.message);
        throw new Error(`Failed to prepare Orbit invitation URL: ${error.message}`);
      }
    } else {
      // Mock invitation URL
      invitationUrl = `https://example.org/mock/${id}`;
      console.log(`[GET /qr] Using mock invitation URL: ${invitationUrl}`);
    }

    // Generate QR code SVG
    const qr = new QRCode({
      content: invitationUrl,
      width: 250,
      height: 250,
      color: "#000000",
      background: "#ffffff",
      ecl: "M"
    });

    const svg = qr.svg();

    // Cache for 5 minutes
    const expiry = Date.now() + (5 * 60 * 1000);
    const responseData = { svg, invitationUrl };
    qrCache.set(id, { svg, expiry });

    console.log(`[QR-DEBUG] proofId:`, id, ' invitationUrl:', responseData.invitationUrl);
    console.log(`[GET /qr] Generated and cached QR for: ${id}`);

    res.setHeader('Content-Type', 'application/json');
    res.json(responseData);

  } catch (error: any) {
    console.error(`[GET /qr] Error generating QR for ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

export default router;