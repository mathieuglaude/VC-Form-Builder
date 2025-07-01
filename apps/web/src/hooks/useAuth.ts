import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple implementation without React Query for now
    setIsLoading(false);
    // Return null user for now - this can be implemented properly later
    setUser(null);
  }, []);

  return {
    user,
    isLoading
  };
}