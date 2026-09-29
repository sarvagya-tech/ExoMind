import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sourceApi } from "@/lib/api-client";
import { workspaceKeys } from "./use-workspaces";

export const sourceKeys = {
  all: (workspaceId) => ["sources", workspaceId],
  detail: (workspaceId, sourceId) => ["sources", workspaceId, sourceId],
};

export function useSources(workspaceId) {
  return useQuery({
    queryKey: sourceKeys.all(workspaceId),
    queryFn: () => sourceApi.list(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useSource(workspaceId, sourceId) {
  return useQuery({
    queryKey: sourceKeys.detail(workspaceId, sourceId),
    queryFn: () => sourceApi.get(workspaceId, sourceId),
    enabled: !!workspaceId && !!sourceId,
  });
}

export function useUploadPdf(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, title }) => sourceApi.uploadPdf(workspaceId, file, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

export function useImportWebsite(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, title }) => sourceApi.importWebsite(workspaceId, { url, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

export function useImportYoutube(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, title }) => sourceApi.importYoutube(workspaceId, { url, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

export function useCreateTextSource(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, content, type }) =>
      sourceApi.createText(workspaceId, { title, content, type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

export function useDeleteSource(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId) => sourceApi.delete(workspaceId, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}

export function useBulkDeleteSources(workspaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceIds) => sourceApi.bulkDelete(workspaceId, sourceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
    },
  });
}
