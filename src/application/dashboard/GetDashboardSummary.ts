import type { CampaignRepository } from '@domain/campaign/CampaignRepository';
import type { Channel } from '@domain/campaign/Channel';
import { buildDashboardSummary } from '@domain/dashboard/DashboardSummary';
import type {
  CampaignListItemOutput,
  KpisOutput,
  ListCampaignsInput,
  MetricsOutput,
} from '../campaigns/dto';
import { toCampaignFilter } from '../campaigns/ListCampaigns';
import { toCampaignListItem, toKpisOutput, toMetricsOutput } from '../campaigns/mappers';

export interface ChannelBreakdownOutput {
  channel: Channel;
  campaignCount: number;
  metrics: MetricsOutput;
  kpis: KpisOutput;
  spendShare: number | null;
}

export interface DashboardSummaryOutput {
  campaignCount: number;
  activeCount: number;
  totals: MetricsOutput;
  kpis: KpisOutput;
  byChannel: ChannelBreakdownOutput[];
  topCampaigns: CampaignListItemOutput[];
}

export type GetDashboardSummaryInput = Pick<ListCampaignsInput, 'period'>;

export const DEFAULT_TOP_LIMIT = 5;

export class GetDashboardSummary {
  constructor(
    private readonly repository: CampaignRepository,
    private readonly topLimit: number = DEFAULT_TOP_LIMIT,
  ) {}

  async execute(input: GetDashboardSummaryInput = {}): Promise<DashboardSummaryOutput> {
    const campaigns = await this.repository.findAll(toCampaignFilter(input));
    const summary = buildDashboardSummary(campaigns, this.topLimit);
    return {
      campaignCount: summary.campaignCount,
      activeCount: summary.activeCount,
      totals: toMetricsOutput(summary.totals),
      kpis: toKpisOutput(summary.totals),
      byChannel: summary.byChannel.map((entry) => ({
        channel: entry.channel,
        campaignCount: entry.campaignCount,
        metrics: toMetricsOutput(entry.metrics),
        kpis: toKpisOutput(entry.metrics),
        spendShare: entry.metrics.spend.ratioTo(summary.totals.spend),
      })),
      topCampaigns: summary.topByRoas.map(toCampaignListItem),
    };
  }
}
