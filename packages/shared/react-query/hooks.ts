import { useQuery } from '@tanstack/react-query';

// Legacy manual hooks - DEPRECATED: Use auto-generated hooks instead
// These are kept for compatibility but should be replaced with auto-generated versions

export function useFormsLegacy() {
  return useQuery({
    queryKey: ['forms'],
    queryFn: () => fetch('/api/forms').then(r => r.json())
  });
}

export function useCredentialLibraryLegacy() {
  return useQuery({
    queryKey: ['cred-lib'],
    queryFn: () => fetch('/api/cred-lib').then(r => r.json())
  });
}

export function useAuthLegacy() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => fetch('/api/auth/user').then(r => r.json())
  });
}

// External service hooks - placeholder for Orbit integration
export function useProof(defId: string | null) {
  return useQuery({
    queryKey: ['proof', defId],
    queryFn: async () => {
      if (!defId) throw new Error('Definition ID required');
      // This would integrate with @external/orbit when needed
      const response = await fetch(`/api/proofs/prepare/${defId}`);
      return response.json();
    },
    enabled: !!defId
  });
}