import fetch from 'node-fetch';

const orbit = {
  baseUrl: process.env.ORBIT_API_BASE_URL || 'https://devapi-verifier.nborbit.ca/',
  apiKey: process.env.ORBIT_API_KEY || '',
  lobId: process.env.ORBIT_LOB_ID || 'a03f92ac-5ce7-4037-b8b5-79ff821b0878'
};

(async () => {
  console.log('[TEST] Testing direct proof-request/url endpoint');
  console.log('[TEST] Orbit config:', { baseUrl: orbit.baseUrl, lobId: orbit.lobId, hasApiKey: !!orbit.apiKey });

  const payload = {
    proofName: "Test Direct Proof",
    proofPurpose: "Testing direct endpoint",
    proofCredFormat: "ANONCREDS",
    messageProtocol: "AIP2_0",
    proofAutoVerify: false,
    requestedAttributes: [
      {
        attributes: ["birthdate_dateint"]
      }
    ],
    requestedPredicates: []
  };

  const url = `${orbit.baseUrl}api/lob/${orbit.lobId}/proof-request/url`;
  console.log('[TEST] Calling URL:', url);
  console.log('[TEST] Payload:', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'api-key': orbit.apiKey, 
        'lobId': orbit.lobId,
        'content-type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('[TEST] HTTP Status:', res.status);
    const responseText = await res.text();
    console.log('[TEST] Response:', responseText);
    
    if (res.status === 200) {
      try {
        const json = JSON.parse(responseText);
        console.log('[TEST] Success! Data keys:', Object.keys(json.data || {}));
        console.log('[TEST] shortUrl:', json.data?.shortUrl);
        console.log('[TEST] longUrl:', json.data?.longUrl);
      } catch (e) {
        console.log('[TEST] Failed to parse JSON:', e);
      }
    }
  } catch (error) {
    console.error('[TEST] Request failed:', error);
  }
})();