import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthorizedActor } from './useAuthorizedActor';
import type { HookTemplate } from '@/backend';

const QUERY_KEY = (authKey: string) => ['hookTemplates', authKey];

export function useGetHookTemplates() {
  const { actor, isReadyForQueries, authContextKey } = useAuthorizedActor();

  return useQuery<HookTemplate[]>({
    queryKey: QUERY_KEY(authContextKey),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      return actor.getHookTemplatesForCaller();
    },
    enabled: isReadyForQueries,
    retry: false,
  });
}

export function useSaveHookTemplates() {
  const { actor, authContextKey } = useAuthorizedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templates: HookTemplate[]) => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      return actor.saveHookTemplates(templates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEY(authContextKey),
      });
    },
  });
}
