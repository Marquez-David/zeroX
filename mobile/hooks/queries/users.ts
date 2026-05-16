import { useMutation, useQueryClient } from '@tanstack/react-query';

import { auth as authApi, users as usersApi } from '@lib/api';
import { queryKeys } from '@lib/queryClient';

type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword, confirmPassword }: ChangePasswordInput) =>
      usersApi.changePassword(oldPassword, newPassword, confirmPassword),
  });
}

export function useChangeUsernameMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => usersApi.changeUsername(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

/**
 * Mirrors `useLogoutMutation` cache cleanup: clears cached user + wipes every
 * query so the app returns to the login screen in a clean state. We call
 * /auth/logout best-effort after /users/me DELETE so any refresh token on the
 * server is revoked too.
 */
export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await usersApi.deleteAccount();
      try {
        await authApi.logout();
      } catch {
        // DELETE /users/me already invalidated the session server-side; ignore
        // any follow-up logout error.
      }
    },
    onSettled: () => {
      queryClient.setQueryData(queryKeys.currentUser, null);
      queryClient.removeQueries();
      queryClient.setQueryData(queryKeys.currentUser, null);
    },
  });
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => usersApi.uploadAvatar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}
