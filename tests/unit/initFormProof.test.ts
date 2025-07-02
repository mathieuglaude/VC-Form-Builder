import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initFormProof } from '../../apps/api/routes/initFormProof';

// Mock dependencies
const mockStorage = {
  getFormById: vi.fn(),
  getFormBySlug: vi.fn(),
};

const mockVerifierService = {
  generateQRCode: vi.fn(),
  cacheQR: vi.fn(),
};

const mockExtractMappings = vi.fn();
const mockBuildDefineProofPayload = vi.fn();

vi.mock('../../apps/api/storage', () => ({
  storage: mockStorage
}));

vi.mock('../../apps/api/services/VerifierService', () => ({
  VerifierService: {
    getInstance: () => mockVerifierService
  }
}));

vi.mock('@shared/mapping', () => ({
  extractMappings: mockExtractMappings,
  buildDefineProofPayload: mockBuildDefineProofPayload
}));

describe('initFormProof', () => {
  const mockReq = {
    body: { formId: '7' }
  } as any;

  const mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as any;

  const mockForm = {
    id: 7,
    name: 'Test Form',
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
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockStorage.getFormById.mockResolvedValue(mockForm);
    mockExtractMappings.mockReturnValue([{
      credentialType: 'Unverified Person',
      attributeName: 'birthdate_dateint',
      mode: 'required'
    }]);
    mockBuildDefineProofPayload.mockReturnValue({
      proofName: 'Test Form proof',
      requestedAttributes: [{ attributes: ['birthdate_dateint'] }]
    });
    mockVerifierService.generateQRCode.mockResolvedValue({
      success: true,
      svg: '<svg>Mock QR</svg>',
      invitationUrl: 'https://example.com/proof'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes proof request successfully with formId', async () => {
    await initFormProof(mockReq, mockRes);

    expect(mockStorage.getFormById).toHaveBeenCalledWith(7);
    expect(mockExtractMappings).toHaveBeenCalledWith(mockForm);
    expect(mockBuildDefineProofPayload).toHaveBeenCalled();
    expect(mockVerifierService.generateQRCode).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      proofId: expect.stringMatching(/^proof_\d+$/)
    }));
  });

  it('initializes proof request with publicSlug', async () => {
    const slugReq = { body: { publicSlug: 'test-form' } } as any;
    mockStorage.getFormBySlug.mockResolvedValue(mockForm);

    await initFormProof(slugReq, mockRes);

    expect(mockStorage.getFormBySlug).toHaveBeenCalledWith('test-form');
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('returns 400 when neither formId nor publicSlug provided', async () => {
    const badReq = { body: {} } as any;

    await initFormProof(badReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'formId or publicSlug is required'
    });
  });

  it('returns 404 when form not found', async () => {
    mockStorage.getFormById.mockResolvedValue(null);

    await initFormProof(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Form not found'
    });
  });

  it('handles forms with no VC mappings', async () => {
    const simpleForm = {
      ...mockForm,
      formSchema: {
        components: [
          {
            key: 'textField',
            properties: { dataSource: 'manual' }
          }
        ]
      }
    };
    
    mockStorage.getFormById.mockResolvedValue(simpleForm);
    mockExtractMappings.mockReturnValue([]);

    await initFormProof(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      requiresVerification: false
    }));
  });

  it('handles service errors gracefully', async () => {
    mockVerifierService.generateQRCode.mockRejectedValue(new Error('API Error'));

    await initFormProof(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Failed to initialize proof request'
    });
  });
});