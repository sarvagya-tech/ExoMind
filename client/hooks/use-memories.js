import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memoryApi } from "@/lib/api-client";

export const memoryKeys = {
  all: ["memories"],
};

export function useMemories() {
  return useQuery({
    queryKey: memoryKeys.all,
    queryFn: () => memoryApi.list(),
  });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => memoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoryKeys.all });
    },
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memoryId, data }) => memoryApi.update(memoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoryKeys.all });
    },
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memoryId) => memoryApi.delete(memoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoryKeys.all });
    },
  });
}
