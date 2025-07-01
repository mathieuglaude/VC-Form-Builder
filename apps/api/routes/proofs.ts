import { Router, Request, Response } from 'express';
import { orbit } from '../src/config';

const router = Router();

// POST /proofs/init - Initialize proof request
router.post('/proofs/init', async (req, res) => {
  try {
    const { formId } = req.body;
    
    if (!formId) {
      return res.status(400).json({ error: 'formId is required' });
    }

    console.log(`[POST /init] Starting proof initialization for form: ${formId}`);

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

export default router;