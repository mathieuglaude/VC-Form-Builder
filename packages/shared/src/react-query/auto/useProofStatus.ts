/**
 * Generated React Query hook for Get proof verification status
 * Auto-generated from packages/shared/src/api-spec/endpoints.ts
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { endpoints } from '../../api-spec/endpoints.js';

// Get response schema from endpoints
const responseSchema = endpoints.getProofStatus.responseSchema;
type ResponseType = ReturnType<typeof responseSchema.parse>;

export function useProofStatus(txId: string | number): UseQueryResult<ResponseType> {
  const url = `/api/proofs/${txId}`;

  return useQuery({
    queryKey: [`proofs/${txId}`],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return responseSchema.parse(data);
    },
    enabled: Boolean(txId),
  });
}

export type { ResponseType as GetProofStatusResponse };
