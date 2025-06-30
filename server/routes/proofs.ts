import { Router } from "express";
import { storage } from "../storage";
import { createProofRequest, sendProofRequest, getProofStatus } from "../services/orbit";

const router = Router();

// POST /api/proofs/init - Initialize proof request for a form
router.post('/init', async (req, res) => {
  try {
    const { formId } = req.body;
    
    if (!formId) {
      return res.status(400).json({ error: 'formId is required' });
    }

    // Look up form configuration
    const formConfig = await storage.getFormConfig(formId);
    if (!formConfig) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Extract unique templateIds from form fields with dataSource === 'verified'
    const metadata = formConfig.metadata as any;
    const vcFields = Object.entries(metadata?.fields || {})
      .filter(([_, fieldMeta]: [string, any]) => fieldMeta.type === 'verified')
      .map(([_, fieldMeta]: [string, any]) => fieldMeta.vcMapping?.credentialType)
      .filter((type): type is string => Boolean(type));

    const uniqueTemplateIds = Array.from(new Set(vcFields));

    if (uniqueTemplateIds.length === 0) {
      return res.json({ message: 'No VC verification required for this form' });
    }

    // Create proof request with Orbit Enterprise
    const proofResponse = await createProofRequest(uniqueTemplateIds);
    
    // Send the proof request to generate QR code
    const sendResponse = await sendProofRequest(proofResponse.proofRequestId);

    res.json({
      qr: sendResponse.qrCode,
      txId: proofResponse.transactionId || proofResponse.proofRequestId
    });

  } catch (error: any) {
    console.error('Proof initialization error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize proof request', 
      details: error.message 
    });
  }
});

// GET /api/proofs/:txId - Poll proof status
router.get('/:txId', async (req, res) => {
  try {
    const { txId } = req.params;
    const status = await getProofStatus(txId);
    res.json(status);
  } catch (error: any) {
    console.error('Proof status error:', error);
    res.status(500).json({ 
      error: 'Failed to get proof status', 
      details: error.message 
    });
  }
});

export default router;