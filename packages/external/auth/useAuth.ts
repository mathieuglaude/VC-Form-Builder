import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '.';

export function useProfile() {
  return useQuery(['profile'], () => auth.profile(), { staleTime: 5 * 60_000 });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation(
    ({ email, password }: { email: string; password: string }) =>
      auth.login(email, password),
    { onSuccess: () => qc.invalidateQueries(['profile']) }
  );
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation(() => auth.logout(), {
    onSuccess: () => qc.invalidateQueries(['profile'])
  });
}