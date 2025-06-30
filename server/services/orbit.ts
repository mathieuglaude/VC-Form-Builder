const BASE = process.env.ORBIT_BASE;
const KEY = process.env.ORBIT_API_KEY;

type ProofReqPayload = {
  name: string;
  requested_attributes: Record<string, any>;
};

function validateEnvironment() {
  if (!BASE || !KEY) {
    throw new Error('Orbit API credentials not configured. Please set ORBIT_BASE and ORBIT_API_KEY environment variables.');
  }
}

export async function createProofRequest(payload: ProofReqPayload) {
  validateEnvironment();
  
  const res = await fetch(`${BASE}/api/present-proof/aip2/send-proposal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KEY!
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
  
  const res = await fetch(`${BASE}/api/present-proof/aip2/records/${txId}`, {
    headers: { 'x-api-key': KEY! }
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