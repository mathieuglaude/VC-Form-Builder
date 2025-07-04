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
  private baseUrl: string;

  constructor(
    private apiKey: string, 
    private lobId: string,
    baseUrl: string = 'https://devapi-verifier.nborbit.ca/'
  ) {
    this.baseUrl = baseUrl;
  }

  // Removed: defineProof method - only using direct single-step process

  async createDirectProofUrl(payload: any): Promise<{ shortUrl: string; longUrl: string }> {
    const headers = {
      'api-key': this.apiKey,
      'lobId': this.lobId,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    };

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

  // Removed: createProofUrl method - only using direct single-step process

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

  // Removed: fallback methods - only using direct single-step process
}