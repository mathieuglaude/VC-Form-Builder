import { env } from '../src/config';

type ProofReqPayload = {
  name: string;
  requested_attributes: Record<string, any>;
};

function validateEnvironment() {
  // Environment validation now happens at startup via Zod schema
  // No need for runtime checks here since env.ORBIT_BASE and env.ORBIT_API_KEY are guaranteed to be valid
}

export async function createProofRequest(payload: ProofReqPayload) {
  validateEnvironment();
  
  const res = await fetch(`${env.ORBIT_BASE}/api/present-proof/aip2/send-proposal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ORBIT_API_KEY
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { presentationExchangeId, qrCode }
}

export async function getProofStatus(txId: string) {
  validateEnvironment();
  
  if (!txId) {
    throw new Error('Transaction ID is required');
  }
  
  const res = await fetch(`${env.ORBIT_BASE}/api/present-proof/aip2/records/${txId}`, {
    headers: { 'x-api-key': env.ORBIT_API_KEY }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { state: 'verified' | ... }
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