import { resolvePeriodPreset, type PeriodPreset } from '@application/campaigns/periodPresets';
import type { GetDashboardSummaryInput } from '@application/dashboard/GetDashboardSummary';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useUseCases } from '../providers/UseCasesContext';
import { queryKeys } from './queryKeys';

export function useDashboardSummary(preset: PeriodPreset) {
  const { getDashboardSummary } = useUseCases();
  const input = useMemo<GetDashboardSummaryInput>(() => {
    const period = resolvePeriodPreset(preset, new Date());
    return period === undefined ? {} : { period };
  }, [preset]);
  return useQuery({
    queryKey: queryKeys.dashboard(input),
    queryFn: () => getDashboardSummary.execute(input),
  });
}
