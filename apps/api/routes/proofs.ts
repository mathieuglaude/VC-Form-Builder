import { Router } from 'express';
import { storage } from '../storage';
import { prepareProofURL, getProofStatus } from '../services/verifier';
import { ensureProofDef } from '../services/proofHelper';

const r = Router();

r.post('/init', async (req, res) => {
  try {
    const { formId } = req.body;
    
    if (!formId) {
      return res.status(400).json({ error: 'Form ID is required' });
    }

    const form = await storage.getFormConfig(parseInt(formId));
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check if form has VC requirements
    if (!form.proofDef || Object.keys(form.proofDef).length === 0) {
      return res.status(400).json({ error: 'No VC fields' });
    }

    // Ensure proof definition exists
    const defId = await ensureProofDef(form);
    
    // Prepare proof URL with Verifier API
    const { proofRequestId, qrCodePng } = await prepareProofURL(defId);
    
    res.json({
      reqId: proofRequestId,
      qr: qrCodePng
    });
  } catch (error) {
    console.error('Error initializing proof request:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('VERIFIER_API_KEY') || errorMessage.includes('VERIFIER_BASE')) {
      res.status(500).json({ 
        error: 'Credential verification service not configured',
        details: 'Please configure Verifier API credentials to enable credential verification'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to initialize proof request',
        details: errorMessage
      });
    }
  }
});

r.get('/:reqId', async (req, res) => {
  try {
    const { reqId } = req.params;
    
    if (!reqId) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    const result = await getProofStatus(reqId);
    
    res.json(result); // { status, attributes }
  } catch (error) {
    console.error('Error getting proof status:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('VERIFIER_API_KEY') || errorMessage.includes('VERIFIER_BASE')) {
      res.status(500).json({ 
        error: 'Credential verification service not configured',
        details: 'Please configure Verifier API credentials to enable credential verification'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to get proof status',
        details: errorMessage
      });
    }
  }
});

export default r;