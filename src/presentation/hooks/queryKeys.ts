import type { ListCampaignsInput } from '@application/campaigns/dto';
import type { GetDashboardSummaryInput } from '@application/dashboard/GetDashboardSummary';

export const queryKeys = {
  campaigns: ['campaigns'] as const,
  campaignList: (input: ListCampaignsInput) => ['campaigns', 'list', input] as const,
  campaignDetails: (id: string) => ['campaigns', 'details', id] as const,
  dashboard: (input: GetDashboardSummaryInput) => ['dashboard', input] as const,
};
