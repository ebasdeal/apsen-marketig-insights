import type { Campaign } from '@domain/campaign/Campaign';
import type { Metrics } from '@domain/campaign/Metrics';
import type {
  CampaignDetailsOutput,
  CampaignListItemOutput,
  KpisOutput,
  MetricsOutput,
} from './dto';

export function toMetricsOutput(metrics: Metrics): MetricsOutput {
  return {
    impressions: metrics.impressions,
    clicks: metrics.clicks,
    conversions: metrics.conversions,
    spend: metrics.spend.amount,
    revenue: metrics.revenue.amount,
  };
}

export function toKpisOutput(metrics: Metrics): KpisOutput {
  const kpis = metrics.kpis();
  return {
    ctr: kpis.ctr?.value ?? null,
    cpc: kpis.cpc?.amount ?? null,
    cpa: kpis.cpa?.amount ?? null,
    roas: kpis.roas,
    conversionRate: kpis.conversionRate?.value ?? null,
  };
}

export function toCampaignListItem(campaign: Campaign): CampaignListItemOutput {
  return {
    id: campaign.id,
    name: campaign.name,
    channel: campaign.channel,
    status: campaign.status,
    periodStart: campaign.period.start.toISOString(),
    periodEnd: campaign.period.end.toISOString(),
    budget: campaign.budget.amount,
    spend: campaign.metrics.spend.amount,
    revenue: campaign.metrics.revenue.amount,
    roas: campaign.kpis().roas,
  };
}

export function toCampaignDetails(campaign: Campaign): CampaignDetailsOutput {
  return {
    ...toCampaignListItem(campaign),
    durationDays: campaign.period.days,
    metrics: toMetricsOutput(campaign.metrics),
    kpis: toKpisOutput(campaign.metrics),
    budgetUsage: campaign.budgetUsage()?.value ?? null,
    overBudget: campaign.isOverBudget(),
  };
}
