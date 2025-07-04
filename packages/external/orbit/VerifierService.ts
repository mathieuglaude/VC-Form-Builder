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

/**
 * VerifierService for Orbit Enterprise API integration
 * 
 * System of Record: https://github.com/4sure-tech/eapi-llm-friendly-format
 * 
 * This service implements the "Prepare URL for Proof Request (Without A Proof Definition ID)" endpoint
 * as documented in the official Orbit Enterprise API specification.
 * 
 * Endpoint: POST /api/lob/{lob_id}/proof-request/url
 * Base URL: https://testapi-verifier.nborbit.ca (dev environment)
 * 
 * Limitations:
 * - External credentials with AnonCreds identifiers require registered credential definitions
 * - Schema IDs and Credential IDs must be numeric references to LOB-registered credentials
 * - Direct endpoint cannot handle external BC Government credentials without prior registration
 */
export class VerifierService {
  private baseUrl: string;

  constructor(
    private apiKey: string, 
    private lobId: string,
    baseUrl: string = 'https://testapi-verifier.nborbit.ca/'
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
        // Use external AnonCreds format for external credentials
        restrictions: (attr.restrictions || []).map((restriction: any) => ({
          // Based on Swagger docs, use minimal format for external credentials
          schemaId: restriction.anoncredsSchemaId,
          credentialId: restriction.anoncredsCredDefId
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