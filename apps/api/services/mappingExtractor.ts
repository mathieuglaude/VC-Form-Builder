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

// Credential mapping with real schema and credential definition IDs
const CRED_MAP: { [key: string]: { schemaId: string; credDefId: string } } = {
  'BC Person Credential': { 
    schemaId: 'RGjWbW1eycP7FrMf4QJvX8:2:Person:1.0',
    credDefId: 'RGjWbW1eycP7FrMf4QJvX8:3:CL:13:Person'
  },
  'BC Lawyer Credential': { 
    schemaId: 'QzLYGuAebsy3MXQ6b1sFiT:2:legal-professional:1.0',
    credDefId: 'QzLYGuAebsy3MXQ6b1sFiT:3:CL:2351:lawyer'
  },
  'BC Digital Business Card v1': { 
    schemaId: 'L6ASjmDDbDH7yPL1t2yFj9:2:business_card:1.0',
    credDefId: 'L6ASjmDDbDH7yPL1t2yFj9:3:CL:728:business_card'
  }
};

export interface DefineProofPayload {
  proofName: string;
  proofPurpose: string;
  proofCredFormat: string;
  requestedAttributes: Array<{
    attributes: string[];
  }>;
  requestedPredicates: Array<any>;
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
      attributes
      // Note: Restrictions removed for define-proof step
      // External AnonCreds restrictions will be applied during proof request
    });
  }

  const payload: DefineProofPayload = {
    proofName: `${formName} proof`,
    proofPurpose: `Verification for ${formName}`,
    proofCredFormat: "ANONCREDS",
    requestedAttributes,
    requestedPredicates: []
  };

  console.log('[DEFINE-PAYLOAD]', JSON.stringify(payload, null, 2));
  return payload;
}