import { Router } from 'express';

function getOrbitConfig() {
  return {
    baseUrl: process.env.ORBIT_VERIFIER_BASE_URL || 'https://devapi-verifier.nborbit.ca',
    apiKey: process.env.ORBIT_API_KEY || 'dummy-api-key',
    lobId: process.env.ORBIT_LOB_ID || 'a03f92ac-5ce7-4037-b8b5-79ff821b0878',
    useRealOrbit: process.env.ORBIT_USE_REAL === 'true'
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
      proofName: `Form ${formId} Verification`,
      version: '1.0',
      requestedAttributes: [
        {
          name: 'given_names',
          restrictions: [
            {
              cred_def_id: 'QzLYGuAebsy3MXQ6b1sFiT:3:CL:20:default'
            }
          ]
        }
      ]
    };

    const fullUrl = `${orbit.baseUrl}api/lob/${orbit.lobId}/define-proof-request`;
    console.log(`[DEFINE-PROOF] Full URL: ${fullUrl}`);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'apiKey': orbit.apiKey,
        'lobId': orbit.lobId,
        'Content-Type': 'application/json'
      },
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