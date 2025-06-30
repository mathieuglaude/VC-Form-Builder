const headers = { 
  'Content-Type': 'application/json', 
  'x-api-key': process.env.VERIFIER_API_KEY || '' 
};

export async function defineProof(defName: string, attrsByCred: Record<string, string[]>) {
  const requested_attributes: any[] = [];
  Object.entries(attrsByCred).forEach(([credDefId, attrs]) =>
    attrs.forEach(a => requested_attributes.push({ 
      name: a, 
      restrictions: [{ cred_def_id: credDefId }] 
    }))
  );
  
  const body = { 
    name: defName, 
    version: '1.0', 
    requested_attributes 
  };
  
  const response = await fetch(`${process.env.VERIFIER_BASE}/api/proof-definition`, { 
    method: 'POST', 
    headers, 
    body: JSON.stringify(body) 
  });
  
  if (!response.ok) {
    throw new Error(`Failed to define proof: ${await response.text()}`);
  }
  
  const result = await response.json();
  return result.proofDefinitionId as string;
}

export async function prepareProofURL(defId: string) {
  const response = await fetch(`${process.env.VERIFIER_BASE}/api/proof-request/prepare-url/${defId}`, { 
    method: 'POST', 
    headers 
  });
  
  if (!response.ok) {
    throw new Error(`Failed to prepare proof URL: ${await response.text()}`);
  }
  
  return response.json(); // { proofRequestId, qrCodePng }
}

export async function getProofStatus(reqId: string) {
  const response = await fetch(`${process.env.VERIFIER_BASE}/api/proof-request/${reqId}`, { 
    headers 
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get proof status: ${await response.text()}`);
  }
  
  return response.json(); // { status: 'presentation_verified', attributes }
}