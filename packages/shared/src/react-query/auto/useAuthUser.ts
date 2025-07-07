/**
 * Generated React Query hook for Get current authenticated user
 * Auto-generated from packages/shared/src/api-spec/endpoints.ts
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { endpoints } from '../../api-spec/endpoints.js';
import { typedFetch } from '../typedFetch.js';

// Get response schema from endpoints
const responseSchema = endpoints.getAuthUser.responseSchema;
type ResponseType = ReturnType<typeof responseSchema.parse>;

export function useAuthUser(): UseQueryResult<ResponseType> {
  const url = '/api/auth/user';

  return useQuery({
    queryKey: ['auth/user'],
    queryFn: () => typedFetch(url, responseSchema),
    
  });
}

export type { ResponseType as GetAuthUserResponse };
