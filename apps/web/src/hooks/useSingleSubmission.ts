import { useQuery } from '@tanstack/react-query';
import type { FormSubmission } from './useFormSubmissions';

export function useSingleSubmission(submissionId: number, options?: {
  enabled?: boolean;
}) {
  const { enabled = true } = options || {};
  
  return useQuery<FormSubmission>({
    queryKey: ['/api/submissions', submissionId],
    enabled: enabled && !!submissionId,
    staleTime: 60000, // 1 minute - single submissions change less frequently
  });
}