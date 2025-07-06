import { useQuery } from '@tanstack/react-query';
import type { FormSubmission } from './useFormSubmissions';
import { buildUrl } from '../utils/buildUrl';

export function useSingleSubmission(submissionId: number, options?: {
  enabled?: boolean;
}) {
  const { enabled = true } = options || {};
  
  const url = buildUrl(`/api/submissions/${submissionId}`);
  
  return useQuery<FormSubmission>({
    queryKey: [url],
    enabled: enabled && !!submissionId,
    staleTime: 60000, // 1 minute - single submissions change less frequently
  });
}