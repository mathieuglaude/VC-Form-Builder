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
    res.status(500).json({ error: 'Failed to create proof request' });
  }
});

r.get('/:txId', async (req, res) => {
  const rec = await getProofStatus(req.params.txId);
  res.json({ state: rec.state });
});

export default r;