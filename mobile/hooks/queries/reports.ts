import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  reports as reportsApi,
  type ReportDetailResponse,
  type ReportListResponse,
} from '@lib/api';
import { queryKeys } from '@lib/queryClient';
import type { Operation, ReportSummary, ReportTotals } from '@lib/types';

const REPORTS_PAGE_SIZE = 50;
const REPORT_OPERATIONS_PAGE_SIZE = 50;

/**
 * Paginated report list, optionally filtered by year. The TanStack Query
 * infinite cache transparently appends pages; consumers see the flattened
 * `reports` array via the `data` selector below.
 */
export function useReports(year: number | null) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.reports.all, { year }],
    queryFn: ({ pageParam }) =>
      reportsApi.list({
        cursor: pageParam,
        limit: REPORTS_PAGE_SIZE,
        year: year ?? undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: ReportListResponse) => lastPage.next_cursor,
  });
}

/**
 * Single report metadata + paginated operations. The metadata block (uuid,
 * date, balance, income, expenses) is the same on every page — we read it
 * from the first page; operations are flattened across pages.
 */
export function useReport(uuid: string | undefined) {
  return useInfiniteQuery({
    queryKey: uuid ? queryKeys.reports.detail(uuid) : ['reports', 'idle'],
    queryFn: async ({ pageParam }) => {
      if (!uuid) {
        return {
          msg: 'OK',
          report: null,
          operations: [],
          next_cursor: null,
        } as unknown as ReportDetailResponse;
      }
      return reportsApi.get(uuid, {
        cursor: pageParam,
        limit: REPORT_OPERATIONS_PAGE_SIZE,
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: ReportDetailResponse) => lastPage.next_cursor,
    enabled: !!uuid,
  });
}

type ReportStats = {
  income: number;
  expenses: number;
  operationCount: number;
};

/**
 * Aggregator on top of the paginated `/reports` endpoint. The year filter is
 * pushed to the server (`?year=…`) so pagination and the row aggregates the
 * server returns reflect just the selected year. Per-row `income` /
 * `expenses` / `operations_count` come straight from the API; the screen
 * totals are summed across the loaded pages.
 *
 * `availableYears` is derived from a separate unfiltered call
 * (`useReports(null)`), which **shares its cache key** with any other place
 * that calls `useReports(null)`. When `year === null` (the typical default)
 * this is the *same* query as `reportsQuery` and only one network request
 * fires; when a year is picked, the unfiltered call fires once and stays
 * cached so the selector never re-loads on subsequent year changes.
 *
 * Pagination is hidden behind this hook by default — `fetchNextPage` is also
 * exposed so list screens can wire `onEndReached`.
 */
export function useYearStats(year: number | null) {
  const reportsQuery = useReports(year);

  // Same cache key as `useReports(null)` everywhere else. Dedupes with
  // `reportsQuery` when `year === null`; otherwise fires once and is reused.
  const allReportsQuery = useReports(null);

  const filteredReports = useMemo<ReportSummary[]>(
    () => reportsQuery.data?.pages.flatMap((p) => p.reports) ?? [],
    [reportsQuery.data],
  );

  const statsByUuid = useMemo(() => {
    const map = new Map<string, ReportStats>();
    filteredReports.forEach((r) => {
      map.set(r.uuid, {
        income: r.income,
        expenses: r.expenses,
        operationCount: r.operations_count,
      });
    });
    return map;
  }, [filteredReports]);

  // Sum the per-row aggregates over the loaded pages. We deliberately ignore
  // the server's `totals` block: it currently doesn't apply the `?year=`
  // filter, so a year-scoped page would show all-time totals instead.
  const totals: ReportTotals = useMemo(() => {
    let balance = 0;
    let income = 0;
    let expenses = 0;
    filteredReports.forEach((r) => {
      balance += r.balance;
      income += r.income;
      expenses += r.expenses;
    });
    return { balance, income, expenses };
  }, [filteredReports]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allReportsQuery.data?.pages.forEach((page) =>
      page.reports.forEach((r) =>
        years.add(new Date(r.date).getUTCFullYear()),
      ),
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [allReportsQuery.data]);

  return {
    filteredReports,
    statsByUuid,
    totalBalance: totals.balance,
    income: totals.income,
    expenses: totals.expenses,
    availableYears,
    isLoading:
      (reportsQuery.isLoading && filteredReports.length === 0) ||
      (allReportsQuery.isLoading && availableYears.length === 0),
    hasNextPage: reportsQuery.hasNextPage,
    fetchNextPage: reportsQuery.fetchNextPage,
    isFetchingNextPage: reportsQuery.isFetchingNextPage,
  };
}

/**
 * Convenience: flatten the operations across all loaded pages of a paginated
 * report-detail query, plus expose pagination controls. Splits responsibility
 * cleanly from `useReport` so the report-detail screen can map operations
 * straight into a `FlatList`.
 */
export function useReportOperations(reportUuid: string | undefined) {
  const query = useReport(reportUuid);

  const operations = useMemo<Operation[]>(
    () => query.data?.pages.flatMap((p) => p.operations) ?? [],
    [query.data],
  );

  const report = query.data?.pages[0]?.report ?? null;

  return {
    report,
    operations,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

/**
 * Uploads a report file (Excel) to the API. On success invalidates every
 * reports/operations cache so list views and aggregates refetch.
 */
export function useUploadReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uri, name }: { uri: string; name: string }) =>
      reportsApi.upload(uri, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: ['operations', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['operations', 'by-category'],
      });
    },
  });
}

/**
 * Deletes a report by UUID. The backend cascade-deletes every operation that
 * belonged to it, so on success we have to refresh:
 * - The reports list (paginated) and per-report detail cache.
 * - Every operations cache: the paginated list, the per-category breakdown,
 *   and the individual `useOperation(uuid)` queries — we don't track which
 *   operation UUIDs belonged to the deleted report, so we invalidate the
 *   whole `['operations']` namespace at once. Any open detail screen pulls
 *   fresh data and surfaces a 404 if its operation is gone.
 */
export function useDeleteReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => reportsApi.delete(uuid),
    onSuccess: (_data, uuid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.removeQueries({ queryKey: queryKeys.reports.detail(uuid) });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
    },
  });
}

export type { ReportStats };
