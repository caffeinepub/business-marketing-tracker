import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthorizedActor } from './useAuthorizedActor';
import type { FacebookOutreachEntry, ResponseStatus, CraftCategory, TypeOfInterest } from '@/backend';
import { ExternalBlob } from '@/backend';

function useCreateEntry() {
  const { actor } = useAuthorizedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      groupName: string;
      groupUrl: string;
      datePosted: string;
      postContent: string;
      numReactions: bigint;
      numComments: bigint;
      responseStatus: ResponseStatus;
      followUpDate: string;
      craftCategory: CraftCategory;
      typeOfInterest: TypeOfInterest;
      attachment: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      return actor.createEntry(
        data.groupName,
        data.groupUrl,
        data.datePosted,
        data.postContent,
        data.numReactions,
        data.numComments,
        data.responseStatus,
        data.followUpDate,
        data.craftCategory,
        data.typeOfInterest,
        data.attachment
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'outreach';
        },
      });
    },
  });
}

function useUpdateEntry() {
  const { actor } = useAuthorizedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      groupName: string;
      groupUrl: string;
      datePosted: string;
      postContent: string;
      numReactions: bigint;
      numComments: bigint;
      responseStatus: ResponseStatus;
      followUpDate: string;
      craftCategory: CraftCategory;
      typeOfInterest: TypeOfInterest;
      attachment: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      return actor.updateEntry(
        data.id,
        data.groupName,
        data.groupUrl,
        data.datePosted,
        data.postContent,
        data.numReactions,
        data.numComments,
        data.responseStatus,
        data.followUpDate,
        data.craftCategory,
        data.typeOfInterest,
        data.attachment
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'outreach';
        },
      });
    },
  });
}

function useDeleteEntry() {
  const { actor } = useAuthorizedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'outreach';
        },
      });
    },
  });
}

function useSaveGroupNotes() {
  const { actor } = useAuthorizedActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { groupUrl: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setGroupNotes(data.groupUrl, data.notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'outreach';
        },
      });
    },
  });
}

export const useOutreachMutations = {
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
  useSaveGroupNotes,
};
