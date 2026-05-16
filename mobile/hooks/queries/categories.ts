import { useQuery } from '@tanstack/react-query';

import { categories as categoriesApi } from '@lib/api';
import { queryKeys } from '@lib/queryClient';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const { categories } = await categoriesApi.list();
      return categories;
    },
    staleTime: 10 * 60 * 1000,
  });
}
