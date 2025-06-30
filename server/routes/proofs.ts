import { Router } from 'express';
import { createProofQR, getProofStatus } from '../services/orbit';
import { storage } from '../storage';

const r = Router();

r.post('/init', async (req, res) => {
  try {
    const { formId } = req.body;
    
    const formConfig = await storage.getFormConfig(parseInt(formId));
    if (!formConfig?.proofDef) {
      return res.status(400).json({ error: 'No VC fields configured' });
    }

    const { txId, qr } = await createProofQR(formConfig.name, formConfig.proofDef);
    res.json({ txId, qr });
  } catch (error) {
    console.error('Failed to create proof request:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Orbit API credentials not configured')) {
      res.status(500).json({ 
        error: 'Credential verification service not configured',
        details: 'Please configure Orbit API credentials to enable credential verification'
      });
    } else {
      res.status(500).json({ error: 'Failed to create proof request' });
    }
  }
});

r.get('/:txId', async (req, res) => {
  try {
    const rec = await getProofStatus(req.params.txId);
    res.json({ state: rec.state });
  } catch (error) {
    console.error('Failed to get proof status:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Orbit API credentials not configured')) {
      res.status(500).json({ 
        error: 'Credential verification service not configured',
        details: 'Please configure Orbit API credentials to enable credential verification'
      });
    } else {
      res.status(500).json({ error: 'Failed to get proof status' });
    }
  }
});

export default r;