import { useQuery } from '@tanstack/react-query';

// Inline API helper
const getProofInitUrl = (opts: { formId?: number; real?: boolean }) => 
  opts.real && opts.formId
    ? `/api/proofs/init-form/${opts.formId}`
    : `/api/proofs/init`;

// Inline typed response
interface ProofInitResponse {
  proofId: string;
  svg: string;
  invitationUrl: string;
  status: 'ok' | 'fallback';
  error?: string;
}

interface UseProofRequestOpts {
  formId?: string;
  publicSlug?: string;
  enabled?: boolean;
}

export const mockProof = {
  proofId: 'mock-debug',
  inviteUrl: '#',
  svg: `<svg width="180" height="180"><text x="10" y="90">MOCK QR</text></svg>`
};

export function useProofRequest({ formId, publicSlug, enabled = true }: UseProofRequestOpts) {
  const searchParams = new URLSearchParams(location.search);
  const inPreview = searchParams.get('preview') === '1';
  const forceReal = !!searchParams.get('real');
  const panelFlag = !!searchParams.get('panel');
  const shouldMock = inPreview && !forceReal && !panelFlag; // preview => mock, unless real=1 or panel=1
  
  console.log('[trace] params', { inPreview, forceReal, panelFlag, shouldMock, formId, publicSlug });

  if (shouldMock) {
    console.log('[useProofRequest] PREVIEW mock proof');
    return { 
      data: { 
        proofId: 'mock-proof-debug', 
        svg: mockProof.svg,
        invitationUrl: mockProof.inviteUrl,
        isMock: true 
      },
      isSuccess: true,
      isLoading: false,
      error: null
    };
  }

  if (inPreview && (forceReal || panelFlag)) {
    console.log('[useProofRequest] real backend call (preview + real=1 or panel=1)');
  }

  // Use typed helper to determine endpoint
  const endpoint = getProofInitUrl({ 
    formId: formId ? parseInt(formId) : undefined, 
    real: forceReal || panelFlag 
  });
  
  console.log('[hook] →', endpoint);

  // Real API call for non-preview mode  
  return useQuery({
    queryKey: ['proof', formId || publicSlug, (forceReal || panelFlag) ? 'real' : 'standard'],
    queryFn: async () => {
      // Use new Orbit integration endpoint when in real mode with formId
      if ((forceReal || panelFlag) && formId) {
        console.log('[useProofRequest] Using real Orbit integration endpoint');
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Failed to initialize Orbit proof request');
        }
        
        const result = await response.json();
        return { 
          proofId: result.proofId, 
          invitationUrl: result.invitationUrl,
          svg: result.svg,
          isMock: false 
        };
      }

      // Standard API call for non-real mode
      const body = formId ? { formId: parseInt(formId) } : { publicSlug };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize proof request');
      }
      
      const result = await response.json();
      return { 
        proofId: result.proofId, 
        svg: result.svg || mockProof.svg,
        invitationUrl: result.invitationUrl || mockProof.inviteUrl,
        isMock: false 
      };
    },
    enabled: enabled && (!!formId || !!publicSlug),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}