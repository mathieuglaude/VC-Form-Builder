#!/usr/bin/env tsx
import { registerLOB } from '../services/orbit';

(async () => {
  try {
    const res = await registerLOB();
    console.log(JSON.stringify(res, null, 2));
    console.log('\n✔  Registration request sent. Check your email for TX-ID & API key.');
  } catch (err: any) {
    console.error('✖  LOB registration failed:', err.message);
    process.exit(1);
  }
})();