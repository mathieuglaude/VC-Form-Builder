#!/usr/bin/env tsx

import { LobClient } from '../../../packages/external/orbit/LobClient.js';

async function getLobDetails() {
  console.log('🔍 Fetching your registered LOB details from Orbit Enterprise...\n');

  const apiKey = process.env.ORBIT_API_KEY;
  if (!apiKey) {
    console.error('❌ ORBIT_API_KEY not found in environment');
    process.exit(1);
  }

  console.log(`📋 Using API Key: ${apiKey.substring(0, 10)}...`);

  try {
    const lobClient = new LobClient('https://api-lob.nborbit.ca/', apiKey);
    
    // Get LOB details - this should return your registered LOB information
    console.log('🌐 Calling GET /lob to retrieve your registered LOB...');
    const response = await lobClient.getLobDetails();
    
    console.log('✅ LOB Details Retrieved:');
    console.log(JSON.stringify(response, null, 2));
    
    if (response.id) {
      console.log(`\n🎯 Your LOB ID is: ${response.id}`);
      console.log(`📝 Update your .env file with: ORBIT_LOB_ID=${response.id}`);
    }

  } catch (error: any) {
    console.error('❌ Failed to retrieve LOB details:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', await error.response.text());
    }
  }
}

// Load environment variables
const envPath = new URL('../.env', import.meta.url);
const fs = await import('fs');
const envFile = fs.readFileSync(envPath, 'utf8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value && !key.startsWith('#')) {
    acc[key.trim()] = value.trim();
  }
  return acc;
}, {} as Record<string, string>);

Object.assign(process.env, envVars);

await getLobDetails();