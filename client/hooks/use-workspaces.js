import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceApi } from "@/lib/api-client";

export const workspaceKeys = {
  all: ["workspaces"],
  detail: (id) => ["workspaces", id],
};

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: () => workspaceApi.list(),
  });
}

export function useWorkspace(workspaceId) {
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: () => workspaceApi.get(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => workspaceApi.create(data),
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useUpdateWorkspace(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => workspaceApi.update(workspaceId, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId) => workspaceApi.delete(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}
