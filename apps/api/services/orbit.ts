import { env } from '../src/config';
import { OrbitClient } from '../../packages/external/orbit/OrbitClient';

// Initialize the OrbitClient with configuration from environment
const orbitClient = new OrbitClient(env.ORBIT_BASE, env.ORBIT_API_KEY);

type ProofReqPayload = {
  name: string;
  requested_attributes: Record<string, any>;
};

export async function createProofRequest(payload: ProofReqPayload) {
  const res = await orbitClient.verifier.sendProposal(payload);
  return res; // { presentationExchangeId, qrCodePng }
}

export async function getProofStatus(txId: string) {
  if (!txId) {
    throw new Error('Transaction ID is required');
  }
  
  const res = await orbitClient.verifier.getRecord(txId);
  return res; // { state: 'verified' | ... }
}

export async function createProofQR(
  name: string,
  templates: Record<string, string[]>
) {
  const requested_attributes: any = {};
  let i = 1;
  
  for (const [templateId, attrs] of Object.entries(templates)) {
    for (const attr of attrs) {
      requested_attributes[`attr${i++}_referent`] = {
        name: attr,
        restrictions: [{ cred_def_id: templateId }]
      };
    }
  }

  const { presentationExchangeId, qrCodePng } = await createProofRequest({
    name,
    requested_attributes
  });
  
  return { txId: presentationExchangeId, qr: qrCodePng };
}