import { env } from '../src/config';

const headers = { 
  'Content-Type': 'application/json', 
  'x-api-key': env.VERIFIER_API_KEY
};

// Debug logging for environment variables
console.log('Verifier API Config:', {
  base: env.VERIFIER_BASE,
  hasKey: env.VERIFIER_API_KEY ? 'yes' : 'no'
});

export async function defineProof(defName: string, attrsByCred: Record<string, string[]>) {
  // Check if we have valid API credentials
  if (!env.VERIFIER_API_KEY || env.VERIFIER_API_KEY === 'demo-key' || env.VERIFIER_API_KEY === 'your_verifier_api_key_here') {
    console.log('No valid Verifier API key - using mock proof definition');
    // Return a mock proof definition ID for demo purposes
    return `mock-proof-def-${Date.now()}`;
  }

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
  
  const response = await fetch(`${env.VERIFIER_BASE}/api/proof-definition`, { 
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
  // Check if we have valid API credentials
  if (!env.VERIFIER_API_KEY || env.VERIFIER_API_KEY === 'demo-key' || env.VERIFIER_API_KEY === 'your_verifier_api_key_here') {
    console.log('No valid Verifier API key - generating mock QR code');
    
    // Generate a mock QR code with a sample BC Wallet deep link
    const mockQrData = `https://digitalwallet.gov.bc.ca/presentation-request?request_uri=https://testapi-verifier.nborbit.ca/api/proof-request/mock-${Date.now()}`;
    
    // Create a simple SVG QR code placeholder
    const qrCodeSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="10" y="10" width="20" height="20" fill="black"/>
      <rect x="50" y="10" width="20" height="20" fill="black"/>
      <rect x="90" y="10" width="20" height="20" fill="black"/>
      <rect x="130" y="10" width="20" height="20" fill="black"/>
      <rect x="170" y="10" width="20" height="20" fill="black"/>
      <rect x="10" y="50" width="20" height="20" fill="black"/>
      <rect x="50" y="50" width="20" height="20" fill="black"/>
      <rect x="90" y="50" width="20" height="20" fill="black"/>
      <rect x="130" y="50" width="20" height="20" fill="black"/>
      <rect x="170" y="50" width="20" height="20" fill="black"/>
      <rect x="10" y="90" width="20" height="20" fill="black"/>
      <rect x="50" y="90" width="20" height="20" fill="black"/>
      <rect x="90" y="90" width="20" height="20" fill="black"/>
      <rect x="130" y="90" width="20" height="20" fill="black"/>
      <rect x="170" y="90" width="20" height="20" fill="black"/>
      <rect x="10" y="130" width="20" height="20" fill="black"/>
      <rect x="50" y="130" width="20" height="20" fill="black"/>
      <rect x="90" y="130" width="20" height="20" fill="black"/>
      <rect x="130" y="130" width="20" height="20" fill="black"/>
      <rect x="170" y="130" width="20" height="20" fill="black"/>
      <rect x="10" y="170" width="20" height="20" fill="black"/>
      <rect x="50" y="170" width="20" height="20" fill="black"/>
      <rect x="90" y="170" width="20" height="20" fill="black"/>
      <rect x="130" y="170" width="20" height="20" fill="black"/>
      <rect x="170" y="170" width="20" height="20" fill="black"/>
      <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="8" fill="white">DEMO QR</text>
    </svg>`;
    
    const qrCodePng = `data:image/svg+xml;base64,${Buffer.from(qrCodeSvg).toString('base64')}`;
    
    return {
      proofRequestId: `mock-request-${Date.now()}`,
      qrCodePng,
      deepLink: mockQrData
    };
  }

  const response = await fetch(`${env.VERIFIER_BASE}/api/proof-request/prepare-url/${defId}`, { 
    method: 'POST', 
    headers 
  });
  
  if (!response.ok) {
    throw new Error(`Failed to prepare proof URL: ${await response.text()}`);
  }
  
  return response.json(); // { proofRequestId, qrCodePng }
}

export async function getProofStatus(reqId: string) {
  const response = await fetch(`${env.VERIFIER_BASE}/api/proof-request/${reqId}`, { 
    headers 
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get proof status: ${await response.text()}`);
  }
  
  return response.json(); // { status: 'presentation_verified', attributes }
}