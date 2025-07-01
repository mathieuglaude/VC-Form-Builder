import { useQuery } from '@tanstack/react-query';

interface UseProofRequestOpts {
  formId?: string;
  publicSlug?: string;
  enabled?: boolean;
}

export function useProofRequest({ formId, publicSlug, enabled = true }: UseProofRequestOpts) {
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