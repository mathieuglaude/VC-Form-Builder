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
  const showPanel = new URLSearchParams(location.search).get('panel') === '1';

  // DEBUG MODE: When preview mode + panel=1 → return mockProof immediately for testing
  if (inPreview && showPanel) {
    console.log('[useProofRequest] returning mock proof for preview debug mode');
    return { data: mockProof, isSuccess: true, isLoading: false, error: null };
  }

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
      
      return response.json();
    },
    enabled: enabled && (!!formId || !!publicSlug),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}