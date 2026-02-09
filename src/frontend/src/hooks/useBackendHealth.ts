import { useQuery } from '@tanstack/react-query';
import { useAuthorizedActor } from './useAuthorizedActor';

/**
 * Hook to check backend health status
 * Works in all modes including anonymous
 * Uses aggressive retry and short stale time for reliable stopped-canister detection
 */
export function useBackendHealth() {
  const { actor, isReadyForQueries, authContextKey } = useAuthorizedActor();

  return useQuery<boolean>({
    queryKey: ['backend', 'health', authContextKey],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      return actor.health();
    },
    enabled: isReadyForQueries,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 10000, // Consider health fresh for 10 seconds only
    gcTime: 30000, // Keep in cache for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
