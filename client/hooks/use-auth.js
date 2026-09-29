import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api-client";

export const authKeys = {
  session: ["auth", "session"],
};

export function useAuthUser() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => authApi.getSession(),
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => authApi.signIn(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authApi.signUp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}
