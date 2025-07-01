import ky from 'ky';
import { orbit } from '../src/config';

(async () => {
  // orbit should contain baseUrl, apiKey, lobId
  const url = `${orbit.baseUrl}/verifier/v1/proof-requests`;   // correct endpoint from docs
  try {
    const json = await ky.get(url, {
      headers: { apiKey: orbit.apiKey, lobId: orbit.lobId }
    }).json();
    console.log('[ORBIT-PING-OK]', json);
    process.exit(0);
  } catch (err: any) {
    console.error('[ORBIT-PING-FAIL]', err.response?.status, await err.response?.text());
    process.exit(1);
  }
})();