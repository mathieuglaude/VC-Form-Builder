/**
 * Mock Orbit API responses for testing
 */

export interface MockOrbitResponse {
  defineProof: {
    success: boolean;
    proofDefineId: string;
  };
  proofUrl: {
    success: boolean;
    invitationUrl: string;
    svg?: string;
  };
  proofStatus: {
    success: boolean;
    status: 'pending' | 'completed' | 'failed';
    verifiedAttributes?: Record<string, any>;
  };
}

export const mockOrbitResponses: MockOrbitResponse = {
  defineProof: {
    success: true,
    proofDefineId: 'mock_proof_define_12345'
  },
  proofUrl: {
    success: true,
    invitationUrl: 'https://devapi-verifier.nborbit.ca/proof/mock_invitation_12345',
    svg: '<svg width="250" height="250"><rect width="250" height="250" fill="white"/><text x="125" y="125" text-anchor="middle">Mock QR</text></svg>'
  },
  proofStatus: {
    success: true,
    status: 'completed',
    verifiedAttributes: {
      birthdate_dateint: '19900115',
      given_name: 'John',
      family_name: 'Doe'
    }
  }
};

export class MockOrbitClient {
  defineProofRequest = vi.fn().mockResolvedValue(mockOrbitResponses.defineProof);
  getProofUrl = vi.fn().mockResolvedValue(mockOrbitResponses.proofUrl);
  getProofStatus = vi.fn().mockResolvedValue(mockOrbitResponses.proofStatus);
  verifyProof = vi.fn().mockResolvedValue({ success: true, verified: true });
}

// Mock fetch for Orbit API calls
export function mockOrbitApi() {
  global.fetch = vi.fn().mockImplementation((url: string, options?: any) => {
    const urlStr = url.toString();
    
    if (urlStr.includes('define-proof-request')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockOrbitResponses.defineProof)
      });
    }
    
    if (urlStr.includes('proof/url')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockOrbitResponses.proofUrl)
      });
    }
    
    if (urlStr.includes('proof-status')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockOrbitResponses.proofStatus)
      });
    }
    
    // Default mock response
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true })
    });
  });
}

// Reset mocks
export function resetOrbitMocks() {
  vi.clearAllMocks();
  if (global.fetch && typeof global.fetch === 'function' && 'mockReset' in global.fetch) {
    (global.fetch as any).mockReset();
  }
}