import type { Route } from 'next';

export const CAMPAIGNS_ROUTE = '/campaigns' satisfies Route;

type CampaignDetailsRoute = `/campaigns/${string}`;

export function campaignDetailsRoute(id: string): Route<CampaignDetailsRoute> {
  return `/campaigns/${encodeURIComponent(id)}`;
}
