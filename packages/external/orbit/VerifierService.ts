import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const QRCode = require('qrcode-svg');

export interface DefineProofPayload {
  proofName: string;
  proofPurpose: string;
  proofCredFormat: string;
  requestedAttributes: Array<{
    attributes: string[];
  }>;
  requestedPredicates: Array<any>;
}

export class VerifierService {
  private qrCache = new Map<number, string>();
  private baseUrl: string;

  constructor(
    private apiKey: string, 
    private lobId: string,
    baseUrl: string = 'https://devapi-verifier.nborbit.ca/'
  ) {
    this.baseUrl = baseUrl;
  }

  async defineProof(payload: DefineProofPayload): Promise<{ proofDefineId: number }> {
    const headers = {
      'api-key': this.apiKey,
      'lobId': this.lobId,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    };

    const response = await fetch(`${this.baseUrl}api/lob/${this.lobId}/define-proof-request`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Define proof failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const proofDefineId = result.data?.proofDefineId;
    
    if (!proofDefineId) {
      throw new Error('No proofDefineId returned from define-proof');
    }

    return { proofDefineId };
  }

  async createProofUrl(args: { proofDefineId: number }): Promise<{ shortUrl: string; longUrl: string }> {
    const headers = {
      'api-key': this.apiKey,
      'lobId': this.lobId,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    };

    const credProofId = crypto.randomUUID();
    const payload = {
      proofDefineId: args.proofDefineId,
      messageProtocol: "AIP2_0",
      credProofId,
      proofAutoVerify: false,
      createClaim: false
    };

    const response = await fetch(`${this.baseUrl}api/lob/${this.lobId}/proof/url?connectionless=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Create proof URL failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const { shortUrl, longUrl } = result.data || {};
    
    if (!shortUrl) {
      throw new Error('No shortUrl returned from proof/url');
    }

    return { shortUrl, longUrl: longUrl || shortUrl };
  }

  generateQrSvg(url: string): string {
    const qr = new QRCode({
      content: url,
      width: 250,
      height: 250,
      color: "#000000",
      background: "#ffffff",
      ecl: "M"
    });
    
    return qr.svg();
  }

  generateFallbackQrSvg(proofDefineId: number): string {
    // Check cache first
    const cached = this.qrCache.get(proofDefineId);
    if (cached) {
      return cached;
    }

    const fallbackUrl = `${this.baseUrl}api/lob/${this.lobId}/proof-request/${proofDefineId}`;
    const svg = this.generateQrSvg(fallbackUrl);
    
    // Cache the result
    this.qrCache.set(proofDefineId, svg);
    
    return svg;
  }

  getFallbackUrl(proofDefineId: number): string {
    return `${this.baseUrl}api/lob/${this.lobId}/proof-request/${proofDefineId}`;
  }
}