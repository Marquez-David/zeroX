import { type PropsWithChildren } from 'react';

import { useCurrentUser } from '@hooks/queries/auth';

/**
 * Session state derived from the TanStack Query cache. Kept as a hook (rather
 * than a React context) because the query cache already holds the user and
 * any consumer can read the same source via `useCurrentUser()`.
 */
export function useSession() {
  const { data: user, isLoading } = useCurrentUser();
  return {
    user: user ?? null,
    session: user ? 'authenticated' : null,
    isLoading,
  };
}

/**
 * Kept as a passthrough so consumers can keep wrapping their tree with
 * <SessionProvider> without changes. Session state now lives in the query
 * cache, so there is nothing to provide.
 */
export function SessionProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}
