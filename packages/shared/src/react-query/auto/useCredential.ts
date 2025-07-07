/**
 * Generated React Query hook for Get specific credential template by ID
 * Auto-generated from packages/shared/src/api-spec/endpoints.ts
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { endpoints } from '../../api-spec/endpoints.js';

// Get response schema from endpoints
const responseSchema = endpoints.getCredential.responseSchema;
type ResponseType = ReturnType<typeof responseSchema.parse>;

export function useCredential(id: string | number): UseQueryResult<ResponseType> {
  const url = `/api/cred-lib/${id}`;

  return useQuery({
    queryKey: [`cred-lib/${id}`],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return responseSchema.parse(data);
    },
    enabled: Boolean(id),
  });
}

export type { ResponseType as GetCredentialResponse };
