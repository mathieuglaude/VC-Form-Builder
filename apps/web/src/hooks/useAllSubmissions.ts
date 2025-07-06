import { useQuery } from '@tanstack/react-query';
import { buildUrl } from '../utils/buildUrl';

export interface FormSubmission {
  id: number;
  formConfigId: number;
  submissionData: any;
  verifiedFields: Record<string, any> | null;
  createdAt: string;
  form?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface PaginatedSubmissions {
  data: FormSubmission[];
  total: number;
  page: number;
  pageSize: number;
}

export function useAllSubmissions(page = 1, pageSize = 20) {
  const url = buildUrl("/api/submissions", { page, pageSize });
  return useQuery<PaginatedSubmissions>({
    queryKey: [url],
    staleTime: 5 * 60_000
  });
}