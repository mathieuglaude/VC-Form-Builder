import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { buildUrl } from '../utils/buildUrl';

export interface FormSubmission {
  id: number;
  formConfigId: number;
  submissionData: any;
  verifiedFields: Record<string, any> | null;
  createdAt: string;
}

export interface PaginatedSubmissions {
  submissions: FormSubmission[];
  hasMore: boolean;
  nextCursor?: number;
}

export function useFormSubmissions(formId: number, options?: {
  cursor?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  const { cursor, pageSize = 20, enabled = true } = options || {};
  
  // Build query params for pagination
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor.toString());
  if (pageSize !== 20) params.append('pageSize', pageSize.toString());
  
  const queryString = params.toString();
  const url = `/api/forms/${formId}/submissions${queryString ? '?' + queryString : ''}`;
  
  console.debug("[DEBUG-submissions-req]", url, { formId, cursor, pageSize });
  
  return useQuery<PaginatedSubmissions | FormSubmission[]>({
    queryKey: [url],
    enabled: enabled && !!formId,
    staleTime: 30000, // 30 seconds
  });
}

export function useFormSubmissionsPaginated(formId: number, page: number, pageSize = 20) {
  const url = buildUrl(`/api/forms/${formId}/submissions`, { page, pageSize });
  return useQuery<PaginatedSubmissions>({
    queryKey: [url],
    staleTime: 300_000
  });
}

// Invalidate submissions cache when new submissions are created
export function invalidateFormSubmissions(formId: number) {
  queryClient.invalidateQueries({
    queryKey: [`/api/forms/${formId}/submissions`]
  });
}