// Using fetch instead of axios to avoid dependency conflicts
const ORBIT_BASE = process.env.ORBIT_BASE;
const REQUEST_TIMEOUT = 15000;

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
      headers: {
        'Content-Type': 'application/json'
      },
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