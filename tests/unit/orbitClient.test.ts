import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrbitClient } from '../../packages/external/src/OrbitClient';

describe('OrbitClient', () => {
  let client: OrbitClient;
  let mockKy: any;

  beforeEach(() => {
    // Mock ky
    mockKy = {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    vi.mock('ky', () => ({
      default: {
        create: () => mockKy
      }
    }));

    process.env.ORBIT_API_KEY = 'test-api-key';
    process.env.ORBIT_LOB_ID = 'test-lob-id';
    process.env.ORBIT_VERIFIER_BASE_URL = 'https://test.api.com';
    
    client = new OrbitClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.ORBIT_API_KEY;
    delete process.env.ORBIT_LOB_ID;
    delete process.env.ORBIT_VERIFIER_BASE_URL;
  });

  describe('Verifier Methods', () => {
    it('defineProofRequest creates proof definition successfully', async () => {
      const mockResponse = { success: true, proofDefineId: 'proof_123' };
      mockKy.post.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const payload = {
        proofName: 'Test Proof',
        requestedAttributes: [{ name: 'birthdate', restrictions: [] }]
      };

      const result = await client.defineProofRequest(payload);

      expect(mockKy.post).toHaveBeenCalledWith(
        'lob/test-lob-id/define-proof-request',
        expect.objectContaining({
          json: payload
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('getProofUrl generates proof URL with QR code', async () => {
      const mockResponse = { 
        success: true, 
        invitationUrl: 'https://proof.url',
        svg: '<svg>QR Code</svg>'
      };
      mockKy.get.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const result = await client.getProofUrl('proof_123', true);

      expect(mockKy.get).toHaveBeenCalledWith(
        'lob/test-lob-id/proof/url',
        expect.objectContaining({
          searchParams: {
            proofDefineId: 'proof_123',
            connectionless: 'true'
          }
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('getProofStatus returns proof verification status', async () => {
      const mockResponse = { 
        success: true, 
        status: 'completed',
        verifiedAttributes: { birthdate: '1990-01-01' }
      };
      mockKy.get.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const result = await client.getProofStatus('proof_123');

      expect(mockKy.get).toHaveBeenCalledWith(
        'lob/test-lob-id/proof/status/proof_123'
      );
      expect(result).toEqual(mockResponse);
    });

    it('verifyProof validates proof submission', async () => {
      const mockResponse = { success: true, verified: true };
      mockKy.post.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const proofData = { proofId: 'proof_123', attributes: {} };
      const result = await client.verifyProof(proofData);

      expect(mockKy.post).toHaveBeenCalledWith(
        'lob/test-lob-id/proof/verify',
        expect.objectContaining({
          json: proofData
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Issuer Methods', () => {
    it('createSchema creates new credential schema', async () => {
      const mockResponse = { success: true, schemaId: 'schema_123' };
      mockKy.post.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const schemaData = {
        name: 'Test Schema',
        version: '1.0',
        attributes: ['name', 'age']
      };

      const result = await client.createSchema(schemaData);

      expect(mockKy.post).toHaveBeenCalledWith(
        'lob/test-lob-id/schema',
        expect.objectContaining({
          json: schemaData
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('createCredentialDefinition creates cred def from schema', async () => {
      const mockResponse = { success: true, credDefId: 'creddef_123' };
      mockKy.post.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const credDefData = {
        schemaId: 'schema_123',
        tag: 'default',
        revocationEnabled: false
      };

      const result = await client.createCredentialDefinition(credDefData);

      expect(mockKy.post).toHaveBeenCalledWith(
        'lob/test-lob-id/credential-definition',
        expect.objectContaining({
          json: credDefData
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('issueCredential issues credential to holder', async () => {
      const mockResponse = { success: true, credentialId: 'cred_123' };
      mockKy.post.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const credentialData = {
        credDefId: 'creddef_123',
        holderDid: 'did:example:holder',
        attributes: { name: 'John Doe', age: '30' }
      };

      const result = await client.issueCredential(credentialData);

      expect(mockKy.post).toHaveBeenCalledWith(
        'lob/test-lob-id/credential/issue',
        expect.objectContaining({
          json: credentialData
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('getIssuanceStatus returns credential issuance status', async () => {
      const mockResponse = { 
        success: true, 
        status: 'issued',
        credentialId: 'cred_123'
      };
      mockKy.get.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const result = await client.getIssuanceStatus('cred_123');

      expect(mockKy.get).toHaveBeenCalledWith(
        'lob/test-lob-id/credential/status/cred_123'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Connection Methods', () => {
    it('createConnection establishes new connection', async () => {
      const mockResponse = { 
        success: true, 
        connectionId: 'conn_123',
        invitationUrl: 'https://invitation.url'
      };
      mockKy.post.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const connectionData = {
        alias: 'Test Connection',
        autoAccept: true
      };

      const result = await client.createConnection(connectionData);

      expect(mockKy.post).toHaveBeenCalledWith(
        'lob/test-lob-id/connection',
        expect.objectContaining({
          json: connectionData
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('getConnection retrieves connection details', async () => {
      const mockResponse = { 
        success: true, 
        connectionId: 'conn_123',
        state: 'active'
      };
      mockKy.get.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const result = await client.getConnection('conn_123');

      expect(mockKy.get).toHaveBeenCalledWith(
        'lob/test-lob-id/connection/conn_123'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Wallet Methods', () => {
    it('getWalletStatus returns wallet health status', async () => {
      const mockResponse = { 
        success: true, 
        status: 'ready',
        walletId: 'wallet_123'
      };
      mockKy.get.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const result = await client.getWalletStatus();

      expect(mockKy.get).toHaveBeenCalledWith(
        'lob/test-lob-id/wallet/status'
      );
      expect(result).toEqual(mockResponse);
    });

    it('listCredentials returns available credentials', async () => {
      const mockResponse = { 
        success: true, 
        credentials: [
          { id: 'cred_1', schemaId: 'schema_123' },
          { id: 'cred_2', schemaId: 'schema_456' }
        ]
      };
      mockKy.get.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

      const result = await client.listCredentials();

      expect(mockKy.get).toHaveBeenCalledWith(
        'lob/test-lob-id/wallet/credentials'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const error = new Error('API Error');
      mockKy.post.mockRejectedValue(error);

      await expect(client.defineProofRequest({})).rejects.toThrow('API Error');
    });

    it('handles network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      mockKy.get.mockRejectedValue(timeoutError);

      await expect(client.getProofStatus('proof_123')).rejects.toThrow('Request timeout');
    });

    it('validates required environment variables', () => {
      delete process.env.ORBIT_API_KEY;
      
      expect(() => new OrbitClient()).toThrow('Missing required environment variables');
    });
  });
});