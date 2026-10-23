import type { CampaignStatus } from '@domain/campaign/CampaignStatus';
import type { Channel } from '@domain/campaign/Channel';

export interface PeriodInput {
  start: string;
  end: string;
}

export interface ListCampaignsInput {
  channel?: Channel;
  status?: CampaignStatus;
  period?: PeriodInput;
}

export interface MetricsOutput {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

export interface KpisOutput {
  ctr: number | null;
  cpc: number | null;
  cpa: number | null;
  roas: number | null;
  conversionRate: number | null;
}

export interface CampaignListItemOutput {
  id: string;
  name: string;
  channel: Channel;
  status: CampaignStatus;
  periodStart: string;
  periodEnd: string;
  budget: number;
  spend: number;
  revenue: number;
  roas: number | null;
}

export interface CampaignDetailsOutput extends CampaignListItemOutput {
  durationDays: number;
  metrics: MetricsOutput;
  kpis: KpisOutput;
  budgetUsage: number | null;
  overBudget: boolean;
}
