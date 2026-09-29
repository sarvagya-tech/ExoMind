import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { artifactApi } from "@/lib/api-client";
import { workspaceKeys } from "./use-workspaces";

export const artifactKeys = {
  all: (workspaceId) => ["artifacts", workspaceId],
  detail: (workspaceId, artifactId) => ["artifacts", workspaceId, artifactId],
};

export function useArtifacts(workspaceId) {
  return useQuery({
    queryKey: artifactKeys.all(workspaceId),
    queryFn: () => artifactApi.list(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useArtifact(workspaceId, artifactId) {
  return useQuery({
    queryKey: artifactKeys.detail(workspaceId, artifactId),
    queryFn: () => artifactApi.get(workspaceId, artifactId),
    enabled: !!workspaceId && !!artifactId,
  });
}

export function useCreateArtifact(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, title, sourceIds }) =>
      artifactApi.create(workspaceId, { type, title, sourceIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artifactKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

export function useDeleteArtifact(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (artifactId) => artifactApi.delete(workspaceId, artifactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artifactKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}
