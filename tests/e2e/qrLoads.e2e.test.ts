import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

describe('QR Code Rendering E2E', () => {
  const API_BASE = 'http://localhost:5000';
  
  it('should return 200 status for proof initialization', async () => {
    const response = await fetch(`${API_BASE}/api/proofs/init-form/7`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status).toBe(200);
  });

  it('should return valid proof response with QR data', async () => {
    const response = await fetch(`${API_BASE}/api/proofs/init-form/7`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    // Should have required fields
    expect(data).toHaveProperty('proofId');
    expect(data).toHaveProperty('invitationUrl');
    expect(data).toHaveProperty('svg');
    expect(data).toHaveProperty('status');
    
    // Invitation URL should be valid format
    expect(data.invitationUrl).toMatch(/^(didcomm:\/\/|https:\/\/)/);
    
    // SVG should contain QR code
    expect(data.svg).toContain('<svg');
    expect(data.svg).toContain('</svg>');
    
    // Status should be valid
    expect(['ok', 'fallback']).toContain(data.status);
  });

  it('should handle invalid form ID gracefully', async () => {
    const response = await fetch(`${API_BASE}/api/proofs/init-form/invalid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should not return 502 status code (regression test)', async () => {
    // This test specifically prevents the regression where validation 
    // logic caused 502 responses instead of 200 with fallback QRs
    const response = await fetch(`${API_BASE}/api/proofs/init-form/7`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status).not.toBe(502);
    expect([200, 400, 404]).toContain(response.status);
  });
});