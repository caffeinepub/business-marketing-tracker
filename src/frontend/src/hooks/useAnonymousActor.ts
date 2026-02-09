import { useQuery } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';

/**
 * Hook that creates and exposes an anonymous backend actor.
 * This actor has no Internet Identity session and no admin token.
 * Used for anonymous/guest access to the application.
 */
export function useAnonymousActor() {
  const query = useQuery<backendInterface>({
    queryKey: ['anonymousActor'],
    queryFn: async () => {
      // Create anonymous actor (no identity, no admin token)
      const actor = await createActorWithConfig();
      return actor;
    },
    staleTime: Infinity,
    retry: false,
  });

  return {
    actor: query.data || null,
    isFetching: query.isFetching,
    isReady: !query.isFetching && !!query.data,
  };
}
