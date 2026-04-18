import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';

import { reports as reportsApi } from '@lib/api';
import { queryKeys } from '@lib/queryClient';
import type { ReportDetail } from '@lib/types';

export function useReports() {
  return useQuery({
    queryKey: queryKeys.reports.all,
    queryFn: async () => {
      const { reports } = await reportsApi.list();
      return reports;
    },
  });
}

export function useReport(uuid: string | undefined) {
  return useQuery({
    queryKey: uuid ? queryKeys.reports.detail(uuid) : queryKeys.reports.all,
    queryFn: async () => {
      if (!uuid) return null;
      const { report } = await reportsApi.get(uuid);
      return report;
    },
    enabled: !!uuid,
  });
}

type ReportStats = {
  income: number;
  expenses: number;
  operationCount: number;
};

function statsFromDetail(detail: ReportDetail): ReportStats {
  let income = 0;
  let expenses = 0;
  for (const op of detail.operations) {
    if (op.amount >= 0) income += op.amount;
    else expenses += Math.abs(op.amount);
  }
  return { income, expenses, operationCount: detail.operations.length };
}

/**
 * Fetches all reports (cheap summary list) plus the full detail of every
 * report that matches `year`, then rolls those operations up into
 * income/expenses totals. Reports are fetched in parallel via `useQueries`
 * and each detail query shares the same cache key as `useReport(uuid)`, so
 * navigating to the report screen reuses the already-loaded payload.
 *
 * Pass `year = null` for "All time".
 */
export function useYearStats(year: number | null) {
  const reportsQuery = useReports();

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

  const statsByUuid = useMemo(() => {
    const map = new Map<string, ReportStats>();
    detailQueries.forEach((query, i) => {
      const uuid = filteredReports[i]?.uuid;
      if (uuid && query.data) {
        map.set(uuid, statsFromDetail(query.data));
      }
    });
    return map;
  }, [detailQueries, filteredReports]);

  const totals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    statsByUuid.forEach((s) => {
      income += s.income;
      expenses += s.expenses;
    });
    return { income, expenses };
  }, [statsByUuid]);

  const totalBalance = useMemo(
    () => filteredReports.reduce((sum, r) => sum + r.balance, 0),
    [filteredReports],
  );

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
    filteredReports,
    statsByUuid,
    totalBalance,
    income: totals.income,
    expenses: totals.expenses,
    availableYears,
    isLoading,
  };
}

export type { ReportStats };
