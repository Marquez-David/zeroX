import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { operations as operationsApi } from '@lib/api';
import { useYearStats } from '@hooks/queries/reports';

type CategoryBreakdownEntry = {
  uuid: string;
  name: string;
  expenses: number;
  /** Original count from the API (`operations` field). */
  operations: number;
  /** Alias kept for legacy consumers that read `operationCount`. */
  operationCount: number;
  percentage: number;
};

/**
 * Per-category expense totals for the given year, served by a single
 * `GET /operations/by-category` call. Years for the selector come from the
 * shared reports cache via `useYearStats(null)` (same source as home/reports
 * so the dropdown stays consistent across screens).
 *
 * Pass `year = null` for "All time".
 */
export function useCategoryBreakdown(year: number | null) {
  const breakdownQuery = useQuery({
    queryKey: ['operations', 'by-category', { year }],
    queryFn: () => operationsApi.byCategory({ year: year ?? undefined }),
    staleTime: 30_000,
  });

  // Years come from the same source the rest of the app uses, so the year
  // selector here matches the one on home/reports.
  const { availableYears } = useYearStats(null);

  const total = breakdownQuery.data?.total_expenses ?? 0;

  const categories = useMemo<CategoryBreakdownEntry[]>(() => {
    const list = breakdownQuery.data?.categories ?? [];
    return list.map((c) => ({
      uuid: c.uuid,
      name: c.name,
      expenses: c.expenses,
      operations: c.operations,
      operationCount: c.operations,
      percentage: total > 0 ? (c.expenses / total) * 100 : 0,
    }));
  }, [breakdownQuery.data, total]);

  return {
    categories,
    totalExpenses: total,
    totalOperationCount: breakdownQuery.data?.total_operation_count ?? 0,
    availableYears,
    isLoading: breakdownQuery.isLoading && categories.length === 0,
  };
}

export type { CategoryBreakdownEntry };
