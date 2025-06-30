// Using fetch instead of axios to avoid dependency conflicts
const ORBIT_BASE = process.env.ORBIT_BASE;
const ORBIT_API_KEY = process.env.ORBIT_API_KEY;
const REQUEST_TIMEOUT = 15000;

// Helper function to create headers with optional API key
function createHeaders(includeApiKey = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (includeApiKey && ORBIT_API_KEY) {
    headers['x-api-key'] = ORBIT_API_KEY;
  }
  
  return headers;
}

export async function registerLOB() {
  if (!ORBIT_BASE) {
    throw new Error('ORBIT_BASE environment variable is required');
  }

  const payload: any = {
    lobDisplayName: process.env.LOB_DISPLAY_NAME,
    lobEmail: process.env.LOB_EMAIL,
    lobOrganizationName: process.env.LOB_ORG_NAME,
    lobRole: process.env.LOB_ROLE?.split(',') || [],
    lobTenancy: process.env.LOB_TENANCY,
    didMethod: process.env.LOB_DID_METHOD,
    lobProtocol: process.env.LOB_PROTOCOL,
    writeLedgerId: Number(process.env.WRITE_LEDGER_ID),
    credentialFormat: process.env.CRED_FORMAT
  };

  // Add optional fields if provided
  if (process.env.LOB_TRUST_URL) payload.lobTrustUrl = process.env.LOB_TRUST_URL;
  if (process.env.LOB_TRUST_API_KEY) payload.lobTrustAPIKey = process.env.LOB_TRUST_API_KEY;

  if (process.env.LOB_EXTERNAL_ENDORSER === 'true') {
    payload.lobExternalEndorser = true;
    payload.endorserDetails = {
      endorserDid: process.env.ENDORSER_DID,
      endorserName: process.env.ENDORSER_NAME
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${ORBIT_BASE}/api/lob/register`, {
      method: 'POST',
      headers: createHeaders(false), // Registration doesn't need API key
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout after 15 seconds');
    }
    throw error;
  }
}

// General Orbit API service function for authenticated requests
export async function orbitRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  if (!ORBIT_BASE) {
    throw new Error('ORBIT_BASE environment variable is required');
  }
  
  if (!ORBIT_API_KEY) {
    throw new Error('ORBIT_API_KEY environment variable is required. Complete LOB registration first.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${ORBIT_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...createHeaders(true),
        ...options.headers
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout after 15 seconds');
    }
    throw error;
  }
}
// Proof lifecycle API wrappers

export async function createProofRequest(formId: number, attributes: string[]): Promise<any> {
  const payload = {
    formId,
    attributes,
    requestedAttributes: attributes.map(attr => ({
      name: attr,
      restrictions: []
    }))
  };

  return await orbitRequest('/api/proofs/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function sendProofRequest(proofReqId: string, walletDid?: string): Promise<any> {
  const payload = {
    proofRequestId: proofReqId,
    ...(walletDid && { walletDid })
  };

  return await orbitRequest('/api/proofs/send', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getProofStatus(txId: string): Promise<any> {
  return await orbitRequest(`/api/proofs/status/${txId}`);
}

export async function verifyProofCallback(payload: any): Promise<any> {
  return {
    verified: payload.verified || false,
    attributes: payload.attributes || {},
    transactionId: payload.transactionId,
    timestamp: new Date().toISOString()
  };
}

// Credential Issuance API wrappers

export async function createSchema(schemaName: string, version: string, attributes: string[]): Promise<any> {
  const payload = {
    schemaName,
    version,
    attributes
  };

  return await orbitRequest('/api/schemas/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createCredentialDefinition(schemaId: string, tag?: string): Promise<any> {
  const payload = {
    schemaId,
    tag: tag || 'default'
  };

  return await orbitRequest('/api/credential-definitions/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function issueCredential(credDefId: string, holderDid: string, attributes: Record<string, any>): Promise<any> {
  const payload = {
    credentialDefinitionId: credDefId,
    holderDid,
    attributes
  };

  return await orbitRequest('/api/issue/credential', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getIssuanceStatus(operationId: string): Promise<any> {
  return await orbitRequest(`/api/issue/status/${operationId}`);
}

export async function verifyIssuanceCallback(payload: any): Promise<any> {
  return {
    issued: payload.issued || false,
    credentialId: payload.credentialId,
    operationId: payload.operationId,
    timestamp: new Date().toISOString()
  };
}
