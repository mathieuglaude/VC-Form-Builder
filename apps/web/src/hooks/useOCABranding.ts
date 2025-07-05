import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OCABranding } from '@/components/oca/OCACredentialCard';

// Hook to fetch OCA branding for a specific credential
export function useOCABranding(credentialId: number) {
  return useQuery({
    queryKey: ['oca-branding', credentialId],
    queryFn: async (): Promise<OCABranding> => {
      const response = await fetch(`/api/oca/credentials/${credentialId}/branding`);
      if (!response.ok) {
        throw new Error('Failed to fetch OCA branding');
      }
      return response.json();
    },
    enabled: !!credentialId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook to fetch OCA preview data
export function useOCAPreview(credentialId: number) {
  return useQuery({
    queryKey: ['oca-preview', credentialId],
    queryFn: async () => {
      const response = await fetch(`/api/oca/credentials/${credentialId}/preview`);
      if (!response.ok) {
        throw new Error('Failed to fetch OCA preview');
      }
      return response.json();
    },
    enabled: !!credentialId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook to refresh OCA bundle for a credential
export function useRefreshOCABundle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentialId: number) => {
      const response = await fetch(`/api/oca/credentials/${credentialId}/refresh`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to refresh OCA bundle');
      }
      return response.json();
    },
    onSuccess: (data, credentialId) => {
      // Invalidate related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['oca-branding', credentialId] });
      queryClient.invalidateQueries({ queryKey: ['oca-preview', credentialId] });
    },
  });
}

// Hook to fetch available OCA repositories
export function useOCARepositories() {
  return useQuery({
    queryKey: ['oca-repositories'],
    queryFn: async () => {
      const response = await fetch('/api/oca/repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch OCA repositories');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch OCA bundle directly from a repository
export function useOCABundle(repositoryId: string, bundlePath: string) {
  return useQuery({
    queryKey: ['oca-bundle', repositoryId, bundlePath],
    queryFn: async (): Promise<OCABranding> => {
      const response = await fetch(`/api/oca/bundle/${repositoryId}?path=${encodeURIComponent(bundlePath)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch OCA bundle');
      }
      return response.json();
    },
    enabled: !!(repositoryId && bundlePath),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}