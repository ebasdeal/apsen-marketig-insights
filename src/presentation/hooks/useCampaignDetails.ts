import { CampaignNotFoundError } from '@domain/shared/DomainError';
import { useQuery } from '@tanstack/react-query';
import { useUseCases } from '../providers/UseCasesContext';
import { queryKeys } from './queryKeys';

export function useCampaignDetails(id: string) {
  const { getCampaignDetails } = useUseCases();
  return useQuery({
    queryKey: queryKeys.campaignDetails(id),
    queryFn: () => getCampaignDetails.execute(id),
    enabled: id.length > 0,
    retry: (failureCount, error) => !(error instanceof CampaignNotFoundError) && failureCount < 1,
  });
}
