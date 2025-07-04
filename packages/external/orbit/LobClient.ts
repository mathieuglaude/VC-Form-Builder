import ky from 'ky';

export interface RegisterLobDto {
  lobDisplayName: string;
  lobEmail: string;
  lobOrganizationName: string;
  lobRole: ('ISSUER' | 'VERIFIER' | 'HOLDER')[];
  lobTenancy: 'SINGLE' | 'MULTI';
  didMethod: 'did:sov' | 'did:web';
  lobProtocol: 'AIP2_0';
  writeLedgerId: number;          // 1 = BCovrin test
  credentialFormat: 'ANONCRED';
  lobTrustUrl: string;
  lobTrustAPIKey: string;
  lobExternalEndorser: boolean;
  endorserDetails?: {
    endorserDid?: string;
    endorserName: string;
  };
}

export class LobClient {
  private apiKey: string;
  private base: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.base = baseUrl ?? process.env.ORBIT_LOB_BASE_URL ?? 'https://devapi-lob.nborbit.ca';
    this.apiKey = apiKey ?? process.env.ORBIT_API_KEY ?? '';
  }

  async register(body: RegisterLobDto) {
    return ky.post(`${this.base}/api/lob/register`, { json: body })
            .json<Record<string, unknown>>();
  }

  async getLobDetails() {
    return ky.get(`${this.base}/api/lob`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    }).json<Record<string, unknown>>();
  }
}