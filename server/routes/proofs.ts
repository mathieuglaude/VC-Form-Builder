import { Router } from 'express';
import { createProofRequest, getProofStatus } from '../services/orbit';

const r = Router();

r.post('/init', async (req, res) => {
  const { formId } = req.body;
  // TEMP payload: request ANY credential with "given_name"
  const { presentationExchangeId, qrCode } = await createProofRequest({
    name: formId,
    requested_attributes: {
      attr1_referent: { name: 'given_name' }
    }
  });
  res.json({ txId: presentationExchangeId, qr: qrCode });
});

r.get('/:txId', async (req, res) => {
  const rec = await getProofStatus(req.params.txId);
  res.json({ state: rec.state });
});

export default r;