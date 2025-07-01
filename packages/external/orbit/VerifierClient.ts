import ky from 'ky';

export interface ProofRequestDefinition {
  proofName: string;
  proofVersion: string;
  comment: string;
  requestedAttributes: Array<{
    name: string;
    restrictions: Array<{
      cred_def_id: string;
      issuer_did: string;
    }>;
    non_revoked: {
      from: number;
      to: number;
    };
  }>;
  requestedPredicates: Array<unknown>;
}

export interface DefineProofResponse {
  proofRequestId: string;
}

export class VerifierClient {
  private api: typeof ky;

  constructor(
    private base = process.env.ORBIT_VERIFIER_BASE_URL!,
    private lob = process.env.ORBIT_LOB_ID!,
    private key = process.env.ORBIT_API_KEY!
  ) {
    console.log('VerifierClient config:', { base: this.base, lob: this.lob, hasKey: !!this.key });
    
    this.api = ky.create({
      prefixUrl: this.base,
      headers: { 
        lobId: this.lob, 
        apiKey: this.key,
        'Content-Type': 'application/json'
      },
      timeout: 10_000
    });
  }

  async defineProof(def: ProofRequestDefinition): Promise<DefineProofResponse> {
    return this.api.post('verifier/v1/proof-requests', { json: def }).json<DefineProofResponse>();
  }

  async prepareUrl(id: string): Promise<{ qrSvg: string; inviteUrl: string }> {
    console.log(`VerifierClient: POST ${this.api.prefixUrl}verifier/v1/proof-requests/${id}/prepare-url`);
    
    return this.api.post(`verifier/v1/proof-requests/${id}/prepare-url`).json<{ qrSvg: string; inviteUrl: string }>();
  }
}

// Create verifier instance lazily to ensure env vars are loaded
let verifierInstance: VerifierClient | null = null;

export const verifier = {
  defineProof: async (def: ProofRequestDefinition): Promise<DefineProofResponse> => {
    console.log('Mock Orbit verifier called with proof definition:', JSON.stringify(def, null, 2));
    
    // For now, return a mock proof request ID
    // This allows us to test the integration flow without requiring actual Orbit connectivity
    const mockProofRequestId = `vcfb_proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      proofRequestId: mockProofRequestId
    };
  },

  prepareUrl: async (id: string): Promise<{ qrSvg: string; inviteUrl: string }> => {
    console.log('Mock Orbit prepareUrl called for proof request:', id);
    
    // Generate mock QR code SVG and invite URL for testing
    const mockQrSvg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="180" height="180" fill="white" stroke="black" stroke-width="2"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12" fill="black">
          <tspan x="100" dy="0">QR Code</tspan>
          <tspan x="100" dy="20">Mock for ${id}</tspan>
        </text>
        <!-- Mock QR pattern -->
        <rect x="20" y="20" width="20" height="20" fill="black"/>
        <rect x="160" y="20" width="20" height="20" fill="black"/>
        <rect x="20" y="160" width="20" height="20" fill="black"/>
        <rect x="60" y="60" width="80" height="80" fill="none" stroke="black" stroke-width="2"/>
      </svg>
    `.trim();
    
    const mockInviteUrl = `didcomm://invite?_url=https://devapi-verifier.nborbit.ca/mock-invite/${id}`;
    
    return {
      qrSvg: mockQrSvg,
      inviteUrl: mockInviteUrl
    };
  }
};