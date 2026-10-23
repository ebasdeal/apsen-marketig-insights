import type { CampaignDetailsOutput, CampaignListItemOutput } from '@application/campaigns/dto';
import type { DashboardSummaryOutput } from '@application/dashboard/GetDashboardSummary';
import { Campaign, type CampaignProps } from '@domain/campaign/Campaign';
import { Metrics, type MetricsProps } from '@domain/campaign/Metrics';
import { DateRange } from '@domain/shared/DateRange';
import { Money } from '@domain/shared/Money';

export interface CampaignOverrides extends Partial<
  Omit<CampaignProps, 'metrics' | 'budget' | 'period'>
> {
  budget?: number;
  period?: [string, string];
  metrics?: Partial<{
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  }>;
}

export function buildMetrics(overrides: CampaignOverrides['metrics'] = {}): Metrics {
  const props: MetricsProps = {
    impressions: overrides.impressions ?? 10000,
    clicks: overrides.clicks ?? 500,
    conversions: overrides.conversions ?? 50,
    spend: Money.of(overrides.spend ?? 1000),
    revenue: Money.of(overrides.revenue ?? 4000),
  };
  return Metrics.create(props);
}

export function buildCampaign(overrides: CampaignOverrides = {}): Campaign {
  const [start, end] = overrides.period ?? ['2026-01-01T00:00:00.000Z', '2026-01-31T00:00:00.000Z'];
  return Campaign.create({
    id: overrides.id ?? 'cmp-1',
    name: overrides.name ?? 'Campanha Teste',
    channel: overrides.channel ?? 'google',
    status: overrides.status ?? 'ativa',
    period: DateRange.fromIso(start, end),
    budget: Money.of(overrides.budget ?? 2000),
    metrics: buildMetrics(overrides.metrics),
  });
}

export function buildListItem(
  overrides: Partial<CampaignListItemOutput> = {},
): CampaignListItemOutput {
  return {
    id: 'cmp-1',
    name: 'Campanha Teste',
    channel: 'google',
    status: 'ativa',
    periodStart: '2026-01-01T00:00:00.000Z',
    periodEnd: '2026-01-31T00:00:00.000Z',
    budget: 2000,
    spend: 1000,
    revenue: 4000,
    roas: 4,
    ...overrides,
  };
}

export function buildDetails(
  overrides: Partial<CampaignDetailsOutput> = {},
): CampaignDetailsOutput {
  return {
    ...buildListItem(),
    durationDays: 31,
    metrics: { impressions: 10000, clicks: 500, conversions: 50, spend: 1000, revenue: 4000 },
    kpis: { ctr: 5, cpc: 2, cpa: 20, roas: 4, conversionRate: 10 },
    budgetUsage: 50,
    overBudget: false,
    ...overrides,
  };
}

export function buildDashboard(
  overrides: Partial<DashboardSummaryOutput> = {},
): DashboardSummaryOutput {
  return {
    campaignCount: 2,
    activeCount: 1,
    totals: { impressions: 20000, clicks: 900, conversions: 90, spend: 3000, revenue: 9000 },
    kpis: { ctr: 4.5, cpc: 3.33, cpa: 33.33, roas: 3, conversionRate: 10 },
    byChannel: [
      {
        channel: 'google',
        campaignCount: 1,
        metrics: { impressions: 10000, clicks: 500, conversions: 50, spend: 2000, revenue: 6000 },
        kpis: { ctr: 5, cpc: 4, cpa: 40, roas: 3, conversionRate: 10 },
        spendShare: 2 / 3,
      },
      {
        channel: 'meta',
        campaignCount: 1,
        metrics: { impressions: 10000, clicks: 400, conversions: 40, spend: 1000, revenue: 3000 },
        kpis: { ctr: 4, cpc: 2.5, cpa: 25, roas: 3, conversionRate: 10 },
        spendShare: null,
      },
    ],
    topCampaigns: [
      buildListItem({ id: 'cmp-1', name: 'Top Um', roas: 5 }),
      buildListItem({ id: 'cmp-2', name: 'Top Dois', roas: 3, channel: 'meta' }),
    ],
    ...overrides,
  };
}
