import type { ListCampaignsInput } from '@application/campaigns/dto';
import { resolvePeriodPreset } from '@application/campaigns/periodPresets';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useUseCases } from '../providers/UseCasesContext';
import type { CampaignFiltersValues } from '../stores/campaignFiltersStore';
import { queryKeys } from './queryKeys';

export function toListCampaignsInput(
  filters: CampaignFiltersValues,
  now: Date,
): ListCampaignsInput {
  const input: ListCampaignsInput = {};
  if (filters.channel !== null) {
    input.channel = filters.channel;
  }
  if (filters.status !== null) {
    input.status = filters.status;
  }
  const period = resolvePeriodPreset(filters.period, now);
  if (period !== undefined) {
    input.period = period;
  }
  return input;
}

export function useCampaigns(filters: CampaignFiltersValues) {
  const { listCampaigns } = useUseCases();
  const { channel, status, period } = filters;
  const input = useMemo(
    () => toListCampaignsInput({ channel, status, period }, new Date()),
    [channel, status, period],
  );
  return useQuery({
    queryKey: queryKeys.campaignList(input),
    queryFn: () => listCampaigns.execute(input),
  });
}
