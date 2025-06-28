import { useQuery } from "@tanstack/react-query";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  jobTitle?: string;
  linkedinProfile?: string;
  website?: string;
  bio?: string;
  profileImage?: string;
  location?: string;
  timezone?: string;
}

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}