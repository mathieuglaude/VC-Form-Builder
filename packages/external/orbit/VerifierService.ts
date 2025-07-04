import { createRequire } from 'module';
import crypto from 'crypto';
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

  async createDirectProofUrl(payload: any): Promise<{ shortUrl: string; longUrl: string }> {
    const headers = {
      'api-key': this.apiKey,
      'lobId': this.lobId,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    };

    console.log('[PAYLOAD-DEBUG] Original payload:', JSON.stringify(payload, null, 2));

    // Transform payload for direct endpoint format based on Swagger docs
    const directPayload = {
      messageProtocol: "AIP2_0",
      credProofId: crypto.randomUUID(),
      proofAutoVerify: false,
      createClaim: false,
      proofName: payload.proofName,
      proofPurpose: payload.proofPurpose,
      proofCredFormat: payload.proofCredFormat,
      addVerificationAuthority: false,
      requestedAttributes: (payload.requestedAttributes || []).map((attr: any) => ({
        attributes: [attr.name],
        // NOTE: Direct endpoint requires pre-registered credential definitions in Orbit
        // External BC Government credentials cannot be used with this approach
        restrictions: (attr.restrictions || []).map((restriction: any) => ({
          schemaId: 1, // Would need valid registered schema ID
          credentialId: 1, // Would need valid registered credential definition ID
          type: ["ConformityAttestation"]
        }))
      })),
      requestedPredicates: payload.requestedPredicates || []
    };

    console.info('[ORBIT-DIRECT] Transformed payload:', JSON.stringify(directPayload, null, 2));

    const response = await fetch(`${this.baseUrl}api/lob/${this.lobId}/proof-request/url`, {
      method: 'POST',
      headers,
      body: JSON.stringify(directPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Direct proof URL failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const { shortUrl, longUrl } = result.data || {};
    
    if (!shortUrl) {
      throw new Error('No shortUrl returned from proof-request/url');
    }

    return { shortUrl, longUrl: longUrl || shortUrl };
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