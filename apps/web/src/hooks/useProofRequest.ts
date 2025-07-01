import { useQuery } from '@tanstack/react-query';

interface UseProofRequestOpts {
  formId?: string;
  publicSlug?: string;
  enabled?: boolean;
}

export function useProofRequest({ formId, publicSlug, enabled = true }: UseProofRequestOpts) {
  const query = useQuery({
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

  // TEMPORARY DEBUG FALLBACK - Remove after WebSocket debugging complete
  if (query.error || !query.data) {
    console.warn('[useProofRequest] falling back to mock proof for debugging');
    return {
      data: {
        proofId: 'mock-proof-debug',
        inviteUrl: '#debug-mode',
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14">DEBUG MODE</text></svg>'
      },
      isLoading: query.isLoading,
      error: null
    };
  }

  return query;
}