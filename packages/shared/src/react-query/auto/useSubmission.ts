/**
 * Generated React Query hook for Get specific submission by ID
 * Auto-generated from packages/shared/src/api-spec/endpoints.ts
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { endpoints } from '../../api-spec/endpoints.js';
import { typedFetch } from '../typedFetch.js';

// Get response schema from endpoints
const responseSchema = endpoints.getSubmission.responseSchema;
type ResponseType = ReturnType<typeof responseSchema.parse>;

export function useSubmission(id: string | number): UseQueryResult<ResponseType> {
  const url = `/api/submissions/${id}`;

  return useQuery({
    queryKey: [`submissions/${id}`],
    queryFn: () => typedFetch(url, responseSchema),
    enabled: Boolean(id),
  });
}

export type { ResponseType as GetSubmissionResponse };
