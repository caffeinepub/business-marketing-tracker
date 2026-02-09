import { useQuery } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

/**
 * Hook that creates an anonymous actor and initializes it with the admin token.
 * This hook is used when the user has a valid caffeineAdminToken but is not authenticated via Internet Identity.
 */
export function useAdminTokenActor() {
  const adminToken = getSecretParameter('caffeineAdminToken') || '';
  const hasAdminToken = !!adminToken;

  const query = useQuery<backendInterface | null>({
    queryKey: ['adminTokenActor', adminToken],
    queryFn: async () => {
      if (!hasAdminToken) return null;
      
      // Create anonymous actor
      const actor = await createActorWithConfig();
      
      // Initialize access control with the admin token
      await actor._initializeAccessControlWithSecret(adminToken);
      
      return actor;
    },
    enabled: hasAdminToken,
    staleTime: Infinity,
    retry: false,
  });

  return {
    actor: query.data || null,
    isFetching: query.isFetching,
    isReady: !query.isFetching && !!query.data,
    hasAdminToken,
  };
}
