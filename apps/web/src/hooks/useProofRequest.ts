import { useQuery } from '@tanstack/react-query';

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
  const inPreview = new URLSearchParams(location.search).get('preview') === '1';
  const shouldMock = inPreview; // only preview => mock

  if (shouldMock) {
    console.log('[useProofRequest] PREVIEW mock proof');
    return { 
      data: { proofId: 'mock-proof-debug', isMock: true },
      isSuccess: true,
      isLoading: false,
      error: null
    };
  }

  // Real API call for non-preview mode
  return useQuery({
    queryKey: ['proof', formId || publicSlug],
    queryFn: async () => {
      const body = formId ? { formId: parseInt(formId) } : { publicSlug };
      
      const response = await fetch('/api/proofs/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize proof request');
      }
      
      const result = await response.json();
      return { proofId: result.proofId, isMock: false };
    },
    enabled: enabled && (!!formId || !!publicSlug),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}