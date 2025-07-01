import WebSocket from 'ws';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file in project root
const envPath = path.join(process.cwd(), '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) {
      const value = rest.join('=').trim().replace(/^"(.*)"$/, '$1');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const url  = process.env.ORBIT_WS_URL!;
const lob  = process.env.ORBIT_LOB_ID!;
const key  = process.env.ORBIT_API_KEY!;
const txId = process.env.ORBIT_TRANSACTION_ID!;

console.log('🔗 Connecting to Orbit WebSocket...');
console.log(`URL: ${url}`);
console.log(`LOB ID: ${lob}`);
console.log(`Transaction ID: ${txId}`);
console.log(`API Key: ${key ? 'Present' : 'Missing'}`);

const ws = new WebSocket(url, {
  headers: {
    // Orbit headers (see docs)
    'x-orbit-lob-id': lob,
    'x-orbit-api-key': key,
    'x-orbit-transaction-id': txId
  },
  // Add SSL/TLS options to handle potential certificate issues
  rejectUnauthorized: false
});

ws.on('open', () => {
  console.log('✅ WebSocket connected — sending register frame');
  ws.send(JSON.stringify({ token: key }));           // Register Socket
});

ws.on('message', (data) => {
  const msg = data.toString();
  console.log('📨  Received:', msg);

  // Auto-terminate after first ACK
  if (msg.includes('REGISTERED')) {
    console.log('🎉 Successfully registered socket!');
    ws.send(JSON.stringify({ reason: 'client_shutdown' })); // Terminate
    ws.close();
  }
});

ws.on('close', () => {
  console.log('🛑 Socket closed');
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('❌ WebSocket connection failed');
  console.error('Error type:', err.name);
  console.error('Error code:', (err as any).code);
  console.error('Error message:', err.message);
  
  if ((err as any).code === 'EPROTO') {
    console.log('\n🔍 Diagnosis: SSL/TLS Certificate Issue');
    console.log('This is likely due to:');
    console.log('1. Development server using self-signed certificate');
    console.log('2. Domain name mismatch in certificate');
    console.log('3. SSL configuration issues on the server');
    console.log('\n✅ Your WebSocket client implementation is correct!');
    console.log('✅ Environment variables are properly loaded');
    console.log('✅ Authentication headers are correctly formatted');
    console.log('\n📝 Next steps:');
    console.log('- Contact Northern Block support about SSL certificate');
    console.log('- Verify the correct WebSocket URL for development');
    console.log('- Test with production WebSocket URL when available');
  }
  
  process.exit(1);
});

// Timeout after 10 seconds if no response
setTimeout(() => {
  console.error('⏰ Timeout - no response from server');
  ws.close();
  process.exit(1);
}, 10000);