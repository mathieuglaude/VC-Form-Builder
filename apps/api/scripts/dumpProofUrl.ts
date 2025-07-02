import fetch from 'node-fetch';

const orbit = {
  baseUrl: process.env.ORBIT_API_BASE_URL || 'https://devapi-verifier.nborbit.ca/',
  apiKey: process.env.ORBIT_API_KEY || '',
  lobId: process.env.ORBIT_LOB_ID || 'a03f92ac-5ce7-4037-b8b5-79ff821b0878'
};

(async () => {
  const proofDefineIdArg = process.argv[2];
  if (!proofDefineIdArg) {
    console.error('Usage: tsx scripts/dumpProofUrl.ts <proofDefineId>');
    process.exit(1);
  }

  const proofDefineId = Number(proofDefineIdArg);
  if (isNaN(proofDefineId)) {
    console.error('[DUMP] proofDefineId must be a valid number, got:', proofDefineIdArg);
    process.exit(1);
  }

  console.log('[DUMP] Testing proofDefineId:', proofDefineId);
  console.log('[DUMP] Orbit config:', { baseUrl: orbit.baseUrl, lobId: orbit.lobId, hasApiKey: !!orbit.apiKey });

  const url = `${orbit.baseUrl}api/lob/${orbit.lobId}/proof/url?connectionless=true`;
  console.log('[DUMP] Calling URL:', url);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'api-key': orbit.apiKey, 
        'content-type': 'application/json' 
      },
      body: JSON.stringify({ 
        proofDefineId, 
        messageProtocol: 'AIP2_0', 
        proofAutoVerify: false 
      })
    });
    
    console.log('[DUMP] HTTP Status:', res.status);
    const responseText = await res.text();
    console.log('[DUMP] Response:', responseText);
    
    if (res.status === 200) {
      try {
        const json = JSON.parse(responseText);
        console.log('[DUMP] Parsed JSON keys:', Object.keys(json));
        console.log('[DUMP] shortUrl:', json.shortUrl);
        console.log('[DUMP] longUrl:', json.longUrl);
        console.log('[DUMP] oobInvitation:', json.oobInvitation);
      } catch (e) {
        console.log('[DUMP] Failed to parse JSON:', e);
      }
    }
  } catch (error) {
    console.error('[DUMP] Request failed:', error);
  }
})();