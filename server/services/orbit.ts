const BASE = process.env.ORBIT_BASE;
const KEY = process.env.ORBIT_API_KEY;

type ProofReqPayload = {
  name: string;
  requested_attributes: Record<string, any>;
};

export async function createProofRequest(payload: ProofReqPayload) {
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
  const res = await fetch(`${BASE}/api/present-proof/aip2/records/${txId}`, {
    headers: { 'x-api-key': KEY! }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { state: 'verified' | ... }
}