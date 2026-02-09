import { useQuery } from '@tanstack/react-query';
import { useAuthorizedActor } from './useAuthorizedActor';
import type { FacebookOutreachEntry } from '@/backend';
import { getTodayString } from '@/utils/dateFormat';

const QUERY_KEYS = {
  entries: (authKey: string) => ['outreach', 'entries', authKey],
  followUpToday: (authKey: string) => ['outreach', 'followUpToday', authKey],
  groupSummary: (authKey: string) => ['outreach', 'groupSummary', authKey],
  groupNotes: (authKey: string, groupUrl: string) => ['outreach', 'groupNotes', authKey, groupUrl],
};

function useListEntries(enabledOverride?: boolean) {
  const { actor, isReadyForQueries, authContextKey } = useAuthorizedActor();

  return useQuery<FacebookOutreachEntry[]>({
    queryKey: QUERY_KEYS.entries(authContextKey),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      const entries = await actor.listEntries(BigInt(0), BigInt(100));
      return entries;
    },
    enabled: enabledOverride !== undefined ? enabledOverride && isReadyForQueries : isReadyForQueries,
    retry: false,
  });
}

function useFollowUpToday(enabledOverride?: boolean) {
  const { actor, isReadyForQueries, authContextKey } = useAuthorizedActor();
  const today = getTodayString();

  return useQuery<FacebookOutreachEntry[]>({
    queryKey: QUERY_KEYS.followUpToday(authContextKey),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      return actor.getFollowUpToday(today);
    },
    enabled: enabledOverride !== undefined ? enabledOverride && isReadyForQueries : isReadyForQueries,
    retry: false,
  });
}

function useGroupSummary(enabledOverride?: boolean) {
  const { actor, isReadyForQueries, authContextKey } = useAuthorizedActor();

  return useQuery<[string, bigint][]>({
    queryKey: QUERY_KEYS.groupSummary(authContextKey),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      return actor.getGroupResponseSummary();
    },
    enabled: enabledOverride !== undefined ? enabledOverride && isReadyForQueries : isReadyForQueries,
    retry: false,
  });
}

function useGroupNotes(groupUrl: string) {
  const { actor, isReadyForQueries, authContextKey } = useAuthorizedActor();

  return useQuery<string | null>({
    queryKey: QUERY_KEYS.groupNotes(authContextKey, groupUrl),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      return actor.getGroupNotes(groupUrl);
    },
    enabled: isReadyForQueries && !!groupUrl,
    retry: false,
  });
}

export const useOutreachQueries = {
  useListEntries,
  useFollowUpToday,
  useGroupSummary,
  useGroupNotes,
};
