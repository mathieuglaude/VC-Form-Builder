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
  private base = process.env.ORBIT_LOB_BASE_URL ?? 
    'https://devapi-lob.nborbit.ca';

  async register(body: RegisterLobDto) {
    return ky.post(`${this.base}/api/lob/register`, { json: body })
            .json<Record<string, unknown>>();
  }
}