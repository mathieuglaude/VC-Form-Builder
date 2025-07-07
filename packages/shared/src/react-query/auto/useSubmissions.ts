/**
 * Generated React Query hook for Get all submissions with pagination
 * Auto-generated from packages/shared/src/api-spec/endpoints.ts
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { endpoints } from '../../api-spec/endpoints.js';
import { typedFetch } from '../typedFetch.js';

// Get response schema from endpoints
const responseSchema = endpoints.getSubmissions.responseSchema;
type ResponseType = ReturnType<typeof responseSchema.parse>;

export function useSubmissions(options?: { page?: string | number, pageSize?: string | number, formId?: string | number }): UseQueryResult<ResponseType> {
  
  const searchParams = options ? new URLSearchParams(
    Object.entries(options).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  const url = '/api/submissions' + (searchParams ? `?${searchParams}` : '');
  

  return useQuery({
    queryKey: ['submissions', options],
    queryFn: () => typedFetch(url, responseSchema),
    
  });
}

export type { ResponseType as GetSubmissionsResponse };
