import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { operations as operationsApi } from '@lib/api';
import { queryKeys } from '@lib/queryClient';
import type { Operation } from '@lib/types';

const OPERATIONS_PAGE_SIZE = 50;

type ChangeCategoryInput = {
  operationUuid: string;
  categoryUuid: string;
};

export function useOperation(uuid: string | undefined) {
  return useQuery({
    queryKey: uuid
      ? queryKeys.operations.detail(uuid)
      : ['operations', 'idle'],
    queryFn: async () => {
      if (!uuid) return null;
      const { operation } = await operationsApi.get(uuid);
      return operation;
    },
    enabled: !!uuid,
  });
}

type UseOperationsParams = {
  year?: number | null;
  categoryUuid?: string;
};

/**
 * Paginated operations list, optionally filtered by year and/or category.
 * Powers the category detail screen and any future "all operations" view.
 */
export function useOperations({ year, categoryUuid }: UseOperationsParams) {
  const query = useInfiniteQuery({
    queryKey: ['operations', 'list', { year: year ?? null, categoryUuid }],
    queryFn: ({ pageParam }) =>
      operationsApi.list({
        cursor: pageParam,
        limit: OPERATIONS_PAGE_SIZE,
        year: year ?? undefined,
        categoryUuid,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    enabled: !!categoryUuid || year !== undefined,
  });

  const operations = useMemo<Operation[]>(
    () => query.data?.pages.flatMap((p) => p.operations) ?? [],
    [query.data],
  );

  return {
    operations,
    isLoading: query.isLoading && operations.length === 0,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

export function useChangeOperationCategory(reportUuid: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ operationUuid, categoryUuid }: ChangeCategoryInput) =>
      operationsApi.changeCategory(operationUuid, categoryUuid),
    onSuccess: (_data, variables) => {
      if (reportUuid) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.reports.detail(reportUuid),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.operations.detail(variables.operationUuid),
      });
      // The aggregate breakdown and any paginated operations lists need to
      // refetch — the operation moved categories so totals/membership change.
      queryClient.invalidateQueries({ queryKey: ['operations', 'by-category'] });
      queryClient.invalidateQueries({ queryKey: ['operations', 'list'] });
    },
  });
}
