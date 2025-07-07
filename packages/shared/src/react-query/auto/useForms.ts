/**
 * Generated React Query hook for Get all forms for current user
 * Auto-generated from packages/shared/src/api-spec/endpoints.ts
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { endpoints } from '../../api-spec/endpoints.js';
import { typedFetch } from '../typedFetch.js';

// Get response schema from endpoints
const responseSchema = endpoints.getForms.responseSchema;
type ResponseType = ReturnType<typeof responseSchema.parse>;

export function useForms(): UseQueryResult<ResponseType> {
  const url = '/api/forms';

  return useQuery({
    queryKey: ['forms'],
    queryFn: () => typedFetch(url, responseSchema),
    
  });
}

export type { ResponseType as GetFormsResponse };
