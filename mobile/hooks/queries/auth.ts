import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  auth as authApi,
  clearTokens,
  loadTokens,
  users as usersApi,
} from '@lib/api';
import { queryKeys } from '@lib/queryClient';
import type { User } from '@lib/types';

type LoginInput = { email: string; password: string };
type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
};
type VerifyInput = { email: string; code: string };

/**
 * Resolves the current session by loading tokens from SecureStore and calling
 * /users/me. Returns null when there is no active session so callers can tell
 * "loaded but logged out" apart from "still loading".
 */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const hasTokens = await loadTokens();
      if (!hasTokens) return null;
      try {
        const { user } = await usersApi.me();
        return user;
      } catch {
        await clearTokens();
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      authApi.login(email, password),
    onSuccess: async () => {
      const { user } = await usersApi.me();
      queryClient.setQueryData(queryKeys.currentUser, user);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: ({ email, password, confirmPassword }: RegisterInput) =>
      authApi.register(email, password, confirmPassword),
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: ({ email, code }: VerifyInput) =>
      authApi.verifyEmail(email, code),
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      queryClient.setQueryData(queryKeys.currentUser, null);
      queryClient.removeQueries();
      queryClient.setQueryData(queryKeys.currentUser, null);
    },
  });
}
