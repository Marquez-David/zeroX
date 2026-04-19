import { useQuery } from '@tanstack/react-query';

type BtcPricePoint = {
  timestamp: number;
  price: number;
};

/**
 * Stubbed — the zeroX backend doesn't expose a BTC price endpoint yet.
 * Kept in place so the crypto screen can render an empty / placeholder state
 * and the real request can be plugged in later without touching consumers.
 *
 * TODO: wire up once the backend exposes something like GET /wallets/btc-price.
 */
export function useBtcPriceHistory() {
  return useQuery<BtcPricePoint[]>({
    queryKey: ['btc-price', 'history'],
    queryFn: async () => [],
    enabled: false,
  });
}

export type { BtcPricePoint };
