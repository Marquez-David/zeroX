import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { operations as operationsApi } from '@lib/api';
import { queryKeys } from '@lib/queryClient';

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
    },
  });
}
