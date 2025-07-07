import { Router } from 'express';
import { orbitConfig } from '../../../packages/shared/src/config';

function getOrbitConfig() {
  return {
    baseUrl: orbitConfig.baseUrl,
    apiKey: orbitConfig.apiKey || 'dummy-api-key',
    lobId: orbitConfig.lobId || 'a03f92ac-5ce7-4037-b8b5-79ff821b0878',
    useRealOrbit: orbitConfig.useReal
  };
}

const router = Router();

router.post('/define-proof/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const orbit = getOrbitConfig();
    
    console.log(`[DEFINE-PROOF] Creating proof definition for form ${formId}`);
    
    if (!orbit.useRealOrbit) {
      // Mock response for development
      const mockProofDef = {
        proofDefId: `mock_proof_def_${Date.now()}`,
        name: `Form ${formId} Proof Definition`,
        version: '1.0',
        status: 'created'
      };
      
      console.log(`[DEFINE-PROOF] Mock proof definition created:`, mockProofDef);
      return res.json(mockProofDef);
    }

    // Real Orbit API call
    const proofDefPayload = {
      requestedAttributes: [
        {
          attributes: [
            "name",
            "description",
            "assessorLevel",
            "assessmentLevel"
          ],
          proofValidTill: "2025-06-30T11:58:41.505Z",
          proofValidFrom: "2025-06-30T11:58:41.505Z",
          restrictions: [
            {
              schemaId: 1,
              credentialId: 1,
              type: [
                "ConformityAttestation",
                "Party",
                "IdentifierScheme",
                "BinaryFile"
              ]
            }
          ]
        }
      ],
      requestedPredicates: [
        {
          attributeName: "age",
          pType: "<",
          pValue: 0,
          proofValidTill: "2025-06-30T11:58:41.506Z",
          proofValidFrom: "2025-06-30T11:58:41.506Z",
          restrictions: [
            {
              schemaId: 1,
              credentialId: 1
            }
          ]
        }
      ],
      proofName: "bcovrin proof define",
      proofPurpose: "for verify anoncreds credential",
      proofCredFormat: "ANONCREDS",
      addVerificationAuthority: false
    };

    const fullUrl = `${orbit.baseUrl}api/lob/${orbit.lobId}/define-proof-request`;
    const headers = {
      'api-key': orbit.apiKey,
      'Content-Type': 'application/json'
    };
    
    console.log(`[DEFINE-PROOF] Full URL: ${fullUrl}`);
    console.log(`[DEFINE-PROOF] Headers:`, {
      'api-key': orbit.apiKey ? `${orbit.apiKey.substring(0, 8)}...` : 'MISSING',
      contentType: headers['Content-Type']
    });
    console.log(`[DEFINE-PROOF] Payload:`, JSON.stringify(proofDefPayload, null, 2));
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(proofDefPayload)
    });

    const responseText = await response.text();
    console.log(`[DEFINE-PROOF] Orbit response:`, response.status, responseText);

    if (!response.ok) {
      throw new Error(`Orbit define-proof failed: ${response.status} ${response.statusText}`);
    }

    const proofDef = JSON.parse(responseText);
    console.log(`[DEFINE-PROOF] Successfully created proof definition:`, proofDef);
    
    res.json(proofDef);
  } catch (error: any) {
    console.error(`[DEFINE-PROOF] Error:`, error.message);
    res.status(500).json({ error: 'Failed to create proof definition' });
  }
});

export default router;