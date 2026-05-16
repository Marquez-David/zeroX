import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { wallets as walletsApi } from '@lib/api';
import { queryKeys } from '@lib/queryClient';

export function useWallets() {
  return useQuery({
    queryKey: queryKeys.wallets.all,
    queryFn: async () => {
      const { wallets } = await walletsApi.list();
      return wallets;
    },
  });
}

/**
 * Real-time wallet balance + transactions. The backend proxies Blockstream,
 * so each fetch hits the network — we set a short staleTime to still benefit
 * from caching when the user briefly navigates away and returns.
 */
export function useWallet(uuid: string | undefined) {
  return useQuery({
    queryKey: uuid ? queryKeys.wallets.detail(uuid) : ['wallets', 'idle'],
    queryFn: async () => {
      if (!uuid) return null;
      const { wallet } = await walletsApi.get(uuid);
      return wallet;
    },
    enabled: !!uuid,
    staleTime: 30_000,
  });
}

export function useAddWalletMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (xpub: string) => walletsApi.add(xpub),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
    },
  });
}

/**
 * Stubbed — the zeroX backend doesn't expose a per-transaction detail
 * endpoint yet. Left in place so the crypto transaction modal can call it
 * and the real request drops in with no consumer changes.
 *
 * TODO: wire up to GET /wallets/transactions/:uuid (or equivalent) once
 * exposed by the backend. Re-enable by setting `enabled: true` and pointing
 * queryFn at the real call.
 */
export function useWalletTransaction(uuid: string | undefined) {
  return useQuery({
    queryKey: uuid ? ['wallets', 'tx', uuid] : ['wallets', 'tx', 'idle'],
    queryFn: async () => {
      // TODO: return (await walletsApi.getTransaction(uuid!)).transaction;
      return null;
    },
    enabled: false,
  });
}

export function useDeleteWalletMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => walletsApi.delete(uuid),
    onSuccess: (_data, uuid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
      queryClient.removeQueries({ queryKey: queryKeys.wallets.detail(uuid) });
    },
  });
}
