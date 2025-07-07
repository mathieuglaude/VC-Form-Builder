/**
 * Generated React Query hook for Get all available credential templates
 * Auto-generated from packages/shared/src/api-spec/endpoints.ts
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { endpoints } from '../../api-spec/endpoints.js';
import { typedFetch } from '../typedFetch.js';

// Get response schema from endpoints
const responseSchema = endpoints.getCredentialLibrary.responseSchema;
type ResponseType = ReturnType<typeof responseSchema.parse>;

export function useCredentialLibrary(): UseQueryResult<ResponseType> {
  const url = '/api/cred-lib';

  return useQuery({
    queryKey: ['cred-lib'],
    queryFn: () => typedFetch(url, responseSchema),
    
  });
}

export type { ResponseType as GetCredentialLibraryResponse };
