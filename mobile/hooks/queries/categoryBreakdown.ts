import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';

import { reports as reportsApi } from '@lib/api';
import { queryKeys } from '@lib/queryClient';
import type { Operation } from '@lib/types';

type CategoryBreakdownEntry = {
  uuid: string;
  name: string;
  expenses: number;
  operationCount: number;
  percentage: number;
  operations: Operation[];
};

/**
 * Aggregates per-category expense totals + the raw expense operations for the
 * given year. Reuses the same per-report detail queries as `useYearStats`
 * (via `queryKeys.reports.detail`), so opening the report detail screen
 * reuses this cache and vice versa.
 *
 * Pass `year = null` for "All time".
 */
export function useCategoryBreakdown(year: number | null) {
  const reportsQuery = useQuery({
    queryKey: queryKeys.reports.all,
    queryFn: async () => {
      const { reports } = await reportsApi.list();
      return reports;
    },
  });

  const filteredReports = useMemo(() => {
    const list = reportsQuery.data ?? [];
    if (year === null) return list;
    return list.filter((r) => new Date(r.date).getFullYear() === year);
  }, [reportsQuery.data, year]);

  const detailQueries = useQueries({
    queries: filteredReports.map((r) => ({
      queryKey: queryKeys.reports.detail(r.uuid),
      queryFn: async () => {
        const { report } = await reportsApi.get(r.uuid);
        return report;
      },
      staleTime: 60_000,
    })),
  });

  const { categories, totalExpenses, totalOperationCount } = useMemo(() => {
    const byUuid = new Map<
      string,
      {
        uuid: string;
        name: string;
        expenses: number;
        operationCount: number;
        operations: Operation[];
      }
    >();
    let totalExpenses = 0;
    let totalOperationCount = 0;

    detailQueries.forEach((q) => {
      if (!q.data) return;
      q.data.operations.forEach((op) => {
        // Expenses-only: negative amounts (money out).
        if (op.amount >= 0) return;
        const amount = Math.abs(op.amount);
        const key = op.category.uuid;
        const current = byUuid.get(key) ?? {
          uuid: op.category.uuid,
          name: op.category.name,
          expenses: 0,
          operationCount: 0,
          operations: [],
        };
        current.expenses += amount;
        current.operationCount += 1;
        current.operations.push(op);
        byUuid.set(key, current);
        totalExpenses += amount;
        totalOperationCount += 1;
      });
    });

    const sorted = Array.from(byUuid.values()).sort(
      (a, b) => b.expenses - a.expenses,
    );
    // Sort each category's operations newest first so the detail screen
    // reads chronologically top-to-bottom.
    sorted.forEach((c) => {
      c.operations.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    });
    const categories: CategoryBreakdownEntry[] = sorted.map((c) => ({
      ...c,
      percentage:
        totalExpenses > 0 ? (c.expenses / totalExpenses) * 100 : 0,
    }));

    return { categories, totalExpenses, totalOperationCount };
  }, [detailQueries]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    (reportsQuery.data ?? []).forEach((r) =>
      years.add(new Date(r.date).getFullYear()),
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [reportsQuery.data]);

  const isLoading =
    reportsQuery.isLoading || detailQueries.some((q) => q.isLoading);

  return {
    categories,
    totalExpenses,
    totalOperationCount,
    availableYears,
    isLoading,
  };
}

export type { CategoryBreakdownEntry };
