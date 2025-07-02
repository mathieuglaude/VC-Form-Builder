/**
 * Extract VC mappings from a form's schema
 */
export interface VCMapping {
  credentialType: string;
  attributeName: string;
}

export function extractMappings(form: any): VCMapping[] {
  const mappings: VCMapping[] = [];
  
  if (!form?.formSchema?.components) {
    console.log('[MAPPINGS] No components found in form schema');
    return mappings;
  }

  for (const component of form.formSchema.components) {
    const vcMapping = component?.properties?.vcMapping;
    
    if (vcMapping?.credentialType && vcMapping?.attributeName) {
      mappings.push({
        credentialType: vcMapping.credentialType,
        attributeName: vcMapping.attributeName
      });
    }
  }

  console.log('[MAPPINGS]', JSON.stringify(mappings, null, 2));
  return mappings;
}

// Hard-coded credential mapping for development
const CRED_MAP: { [key: string]: { schemaId: number; credentialId: number } } = {
  'BC Person Credential': { schemaId: 1, credentialId: 1 },
  'BC Lawyer Credential': { schemaId: 2, credentialId: 2 },
  'BC Digital Business Card v1': { schemaId: 3, credentialId: 3 }
};

export interface DefineProofPayload {
  proofName: string;
  proofCredFormat: string;
  requestedAttributes: Array<{
    attributes: string[];
    restrictions: Array<{
      schemaId: number;
      credentialId: number;
    }>;
  }>;
}

export function buildDefineProofPayload(formName: string, mappings: VCMapping[]): DefineProofPayload {
  // Group mappings by credential type
  const credentialGroups: { [credType: string]: string[] } = {};
  
  for (const mapping of mappings) {
    if (!credentialGroups[mapping.credentialType]) {
      credentialGroups[mapping.credentialType] = [];
    }
    credentialGroups[mapping.credentialType].push(mapping.attributeName);
  }

  // Build requested attributes
  const requestedAttributes = [];
  
  for (const [credentialType, attributes] of Object.entries(credentialGroups)) {
    const credMapping = CRED_MAP[credentialType];
    if (!credMapping) {
      console.warn(`[DEFINE-PAYLOAD] Unknown credential type: ${credentialType}`);
      continue;
    }

    requestedAttributes.push({
      attributes,
      restrictions: [{
        schemaId: credMapping.schemaId,
        credentialId: credMapping.credentialId
      }]
    });
  }

  const payload: DefineProofPayload = {
    proofName: `${formName} proof`,
    proofCredFormat: "ANONCREDS",
    requestedAttributes
  };

  console.log('[DEFINE-PAYLOAD]', JSON.stringify(payload, null, 2));
  return payload;
}