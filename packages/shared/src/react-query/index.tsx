import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

// Re-export auto-generated hooks (preferred - these take precedence)
export * from './auto/index.js';

// Centralized QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Dev-mode runtime guards for React Query
if (import.meta.env.DEV) {
  queryClient.getQueryCache().subscribe(event => {
    if (event?.type === 'unhandledError') {
      console.warn('[RQ-Guard] Unhandled query error detected:', {
        queryKey: event.query?.queryKey,
        error: event.error,
        timestamp: new Date().toISOString()
      });
      
      // Additional validation error logging
      if (event.error?.name === 'TypedFetchError') {
        console.error('[RQ-Guard] Schema validation failure - check API response format');
      }
    }
  });
  
  queryClient.getMutationCache().subscribe(event => {
    if (event?.type === 'unhandledError') {
      console.warn('[RQ-Guard] Unhandled mutation error detected:', {
        mutationKey: event.mutation?.options?.mutationKey,
        error: event.error,
        timestamp: new Date().toISOString()
      });
    }
  });
}

// Provider component that wraps the app
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// Export the client for use in utilities and custom hooks
export { queryClient };

// Common query keys factory
export const queryKeys = {
  forms: () => ['forms'] as const,
  form: (id: string | number) => ['forms', id] as const,
  formSubmissions: (formId: string | number) => ['forms', formId, 'submissions'] as const,
  credentials: () => ['credentials'] as const,
  credential: (id: string | number) => ['credentials', id] as const,
  proofs: () => ['proofs'] as const,
  proof: (id: string) => ['proofs', id] as const,
  globalSubmissions: () => ['global-submissions'] as const,
} as const;

// Common API request utility
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}