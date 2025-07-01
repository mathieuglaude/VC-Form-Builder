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
  }
};