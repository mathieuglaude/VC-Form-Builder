// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock environment variables
process.env.DATABASE_URL = 'test';
process.env.ORBIT_API_KEY = 'test-key';
process.env.ORBIT_LOB_ID = 'test-lob';

// Mock database and external dependencies  
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
};

vi.mock('../../apps/api/db', () => ({ db: mockDb }));

// Mock storage
const mockStorage = {
  getFormById: vi.fn(),
  getFormBySlug: vi.fn(),
  getAllForms: vi.fn(),
  createForm: vi.fn(),
  updateForm: vi.fn(),
  deleteForm: vi.fn(),
  getAllCredentials: vi.fn(),
  getCredentialById: vi.fn(),
  createCredential: vi.fn(),
  updateCredential: vi.fn(),
  deleteCredential: vi.fn(),
  getSubmissions: vi.fn(),
  createSubmission: vi.fn(),
};

vi.mock('../../apps/api/storage', () => ({ storage: mockStorage }));

// Mock Orbit API
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('define-proof-request')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, proofDefineId: 'test_proof_123' })
    });
  }
  if (url.includes('proof/url')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ 
        success: true, 
        invitationUrl: 'https://example.com/proof',
        svg: '<svg>test</svg>'
      })
    });
  }
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
});

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Import and set up the Express app after mocks are in place
    const { registerRoutes } = await import('../../apps/api/routes');
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock data
    mockStorage.getFormById.mockResolvedValue({
      id: 7,
      name: 'Test Form',
      slug: 'test-form',
      formSchema: {
        components: [
          {
            key: 'birthdate',
            properties: {
              dataSource: 'verified',
              vcMapping: {
                credentialType: 'Unverified Person',
                attributeName: 'birthdate_dateint'
              },
              credentialMode: 'required'
            }
          }
        ]
      }
    });

    mockStorage.getAllForms.mockResolvedValue([
      { id: 7, name: 'Test Form', slug: 'test-form', isPublic: false }
    ]);

    mockStorage.getAllCredentials.mockResolvedValue([
      { id: 1, label: 'Test Credential', schemaId: 'test:schema:1.0' }
    ]);
  });

  describe('Proof Flow API', () => {
    it('POST /api/proofs/init - initializes proof request successfully', async () => {
      const res = await request(app)
        .post('/api/proofs/init')
        .send({ formId: '7' });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('proofId');
      expect(res.body.proofId).toMatch(/^proof_\d+$/);
    });

    it('POST /api/proofs/init - validates required parameters', async () => {
      const res = await request(app)
        .post('/api/proofs/init')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('POST /api/proofs/init - handles form not found', async () => {
      mockStorage.getFormById.mockResolvedValue(null);
      
      const res = await request(app)
        .post('/api/proofs/init')
        .send({ formId: '999' });
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Form not found');
    });

    it('GET /api/proofs/:id/qr - generates QR code for valid proof', async () => {
      // First create a proof
      const initRes = await request(app)
        .post('/api/proofs/init')
        .send({ formId: '7' });
      
      const proofId = initRes.body.proofId;
      
      const qrRes = await request(app)
        .get(`/api/proofs/${proofId}/qr`);
      
      expect(qrRes.status).toBe(200);
      expect(qrRes.body).toHaveProperty('svg');
      expect(qrRes.body).toHaveProperty('invitationUrl');
      expect(qrRes.body.svg).toContain('<svg');
    });

    it('GET /api/proofs/:id/qr - handles invalid proof ID', async () => {
      const res = await request(app)
        .get('/api/proofs/invalid_proof/qr');
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Forms API', () => {
    it('GET /api/forms - returns list of forms', async () => {
      const res = await request(app)
        .get('/api/forms');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /api/forms/:id - returns specific form', async () => {
      const res = await request(app)
        .get('/api/forms/7');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 7);
      expect(res.body).toHaveProperty('name', 'Test Form');
    });

    it('GET /api/forms/:id - handles form not found', async () => {
      mockStorage.getFormById.mockResolvedValue(null);
      
      const res = await request(app)
        .get('/api/forms/999');
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('POST /api/forms - creates new form', async () => {
      const newForm = {
        name: 'New Test Form',
        slug: 'new-test-form',
        formSchema: { components: [] }
      };
      
      mockStorage.createForm.mockResolvedValue({ id: 8, ...newForm });
      
      const res = await request(app)
        .post('/api/forms')
        .send(newForm);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 8);
      expect(res.body).toHaveProperty('name', 'New Test Form');
    });
  });

  describe('Credentials API', () => {
    it('GET /api/cred-lib - returns credential library', async () => {
      const res = await request(app)
        .get('/api/cred-lib');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/cred-lib/:id - returns specific credential', async () => {
      mockStorage.getCredentialById.mockResolvedValue({
        id: 1,
        label: 'Test Credential',
        schemaId: 'test:schema:1.0'
      });
      
      const res = await request(app)
        .get('/api/cred-lib/1');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('label', 'Test Credential');
    });
  });

  describe('Environment API', () => {
    it('GET /env - returns environment status', async () => {
      const res = await request(app)
        .get('/env');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
    });
  });
});