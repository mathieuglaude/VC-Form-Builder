/**
 * Proof request utilities for extracting VC mappings from forms
 * and building Orbit Enterprise proof request payloads
 */

export interface VCMapping {
  credentialType: string;
  attributeName: string;
  mode: 'required' | 'optional';
}

export interface FormComponent {
  key: string;
  type: string;
  properties?: {
    dataSource?: string;
    vcMapping?: {
      credentialType: string;
      attributeName: string;
    };
    credentialMode?: 'required' | 'optional';
  };
}

export interface FormSchema {
  components: FormComponent[];
}

/**
 * Extract VC mappings from a form schema
 * @param formSchema - The form schema containing components
 * @returns Array of VC mappings or empty array if no VC fields
 */
export function extractMappings(formSchema: FormSchema): VCMapping[] {
  if (!formSchema?.components) {
    return [];
  }

  return formSchema.components
    .filter(comp => comp.properties?.dataSource === 'verified')
    .map(comp => ({
      credentialType: comp.properties?.vcMapping?.credentialType || '',
      attributeName: comp.properties?.vcMapping?.attributeName || '',
      mode: comp.properties?.credentialMode || 'optional'
    }))
    .filter(mapping => mapping.credentialType && mapping.attributeName);
}

/**
 * Credential definition mapping for known credential types
 * Maps from our internal credential type names to Orbit AnonCreds identifiers
 */
const CRED_MAP: Record<string, {
  credDefId: string;
  issuerDid: string;
  schemaName: string;
  schemaVersion: string;
  schemaId: string;
}> = {
  "Unverified Person": {
    credDefId: "QzLYGuAebsy3MXQ6b1sFiT:3:CL:123456:default",
    issuerDid: "QzLYGuAebsy3MXQ6b1sFiT",
    schemaName: "person_credential",
    schemaVersion: "1.0",
    schemaId: "QzLYGuAebsy3MXQ6b1sFiT:2:person_credential:1.0"
  },
  "BC Digital Business Card v1": {
    credDefId: "RGjWbW1eycP7FrMf4QJvX8:3:CL:13:MYCO_Biomarker",
    issuerDid: "RGjWbW1eycP7FrMf4QJvX8",
    schemaName: "digital_business_card",
    schemaVersion: "1.0",
    schemaId: "RGjWbW1eycP7FrMf4QJvX8:2:digital_business_card:1.0"
  },
  "BC Lawyer Credential v1": {
    credDefId: "QzLYGuAebsy3MXQ6b1sFiT:3:CL:789:legal_professional",
    issuerDid: "QzLYGuAebsy3MXQ6b1sFiT",
    schemaName: "legal_professional",
    schemaVersion: "1.0",
    schemaId: "QzLYGuAebsy3MXQ6b1sFiT:2:legal-professional:1.0"
  }
};

export interface OrbitProofRequest {
  proofName: string;
  proofPurpose: string;
  proofCredFormat: "ANONCREDS";
  requestedAttributes: Array<{
    name: string;
    restrictions: Array<{
      anoncredsCredDefId: string;
      anoncredsIssuerDid: string;
      anoncredsSchemaName: string;
      anoncredsSchemaVersion: string;
      anoncredsSchemaId: string;
    }>;
  }>;
  requestedPredicates: Array<any>;
}

/**
 * Build Orbit Enterprise proof request payload from VC mappings
 * @param mappings - Array of VC mappings extracted from form
 * @param formName - Name of the form for proof identification
 * @returns Orbit proof request payload or null if no valid mappings
 */
export function buildDefinePayload(
  mappings: VCMapping[], 
  formName: string = "Form", 
  orbitMappings?: Map<string, { orbitSchemaId: number; orbitCredDefId: number }>
): OrbitProofRequest | null {
  if (!mappings.length) {
    return null;
  }

  const requestedAttributes = mappings
    .map(mapping => {
      // If Orbit mappings are provided, use numeric IDs for direct endpoint
      if (orbitMappings?.has(mapping.credentialType)) {
        const orbitMapping = orbitMappings.get(mapping.credentialType)!;
        return {
          name: mapping.attributeName,
          restrictions: [{
            schemaId: orbitMapping.orbitSchemaId,
            credentialId: orbitMapping.orbitCredDefId
          }]
        };
      }

      // Fallback to external AnonCreds format (for legacy compatibility)
      const credDef = CRED_MAP[mapping.credentialType];
      if (!credDef) {
        console.warn(`[buildDefinePayload] Unknown credential type: ${mapping.credentialType}`);
        return null;
      }

      return {
        name: mapping.attributeName,
        restrictions: [{
          anoncredsCredDefId: credDef.credDefId,
          anoncredsIssuerDid: credDef.issuerDid,
          anoncredsSchemaName: credDef.schemaName,
          anoncredsSchemaVersion: credDef.schemaVersion,
          anoncredsSchemaId: credDef.schemaId
        }]
      };
    })
    .filter(Boolean) as OrbitProofRequest['requestedAttributes'];

  if (!requestedAttributes.length) {
    return null;
  }

  return {
    proofName: `${formName} proof`,
    proofPurpose: `Verification for ${formName}`,
    proofCredFormat: "ANONCREDS",
    requestedAttributes,
    requestedPredicates: []
  };
}

/**
 * Extracts the actual wallet-friendly invitation URL from Orbit API response
 * Checks for shortUrl, longUrl, or nested oobInvitation.url
 */
export function extractInvitationUrl(response: any): string | null {
  if (response?.shortUrl) return response.shortUrl;
  if (response?.longUrl) return response.longUrl;
  if (response?.oobInvitation?.url) return response.oobInvitation.url;
  return null;
}