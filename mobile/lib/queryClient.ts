import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@lib/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx client errors; retry up to 2 times otherwise.
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
      // Reports / operations / wallets only change on explicit user actions
      // (upload, delete, change category, add wallet). Mutations invalidate
      // the affected keys, so a long staleTime is safe and stops the
      // navigate-away-and-back refetches that show up in the API logs.
      staleTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export const queryKeys = {
  currentUser: ['auth', 'me'] as const,
  reports: {
    all: ['reports'] as const,
    detail: (uuid: string) => ['reports', uuid] as const,
  },
  operations: {
    detail: (uuid: string) => ['operations', uuid] as const,
  },
  categories: ['categories'] as const,
  wallets: {
    all: ['wallets'] as const,
    detail: (uuid: string) => ['wallets', uuid] as const,
  },
};
