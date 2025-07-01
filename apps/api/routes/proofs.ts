import { Router, Request, Response } from 'express';
import { orbit } from '../src/config';
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

    // TODO: Real Orbit integration when useRealOrbit is true
    // For now, return mock even when enabled since API endpoints need fixing
    const mockProofId = `mock_${Date.now()}`;
    console.log(`[POST /init] Orbit integration pending - using mock proof ID: ${mockProofId}`);
    res.status(201).json({ proofId: mockProofId });

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
      // TODO: Call Orbit "Prepare URL for Proof Request" API
      // For now, use mock URL even when useRealOrbit is true
      invitationUrl = `https://example.org/mock/${id}`;
      console.log(`[GET /qr] Orbit integration pending - using mock URL: ${invitationUrl}`);
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