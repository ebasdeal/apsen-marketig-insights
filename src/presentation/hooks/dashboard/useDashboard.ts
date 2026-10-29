'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { dashboardKeys } from './dashboardKeys';

export function useDashboardOverview() {
  const { dashboard } = useUseCases();
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: () => dashboard.overview.execute(),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });
}
