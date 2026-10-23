import type { Campaign } from '../campaign/Campaign';
import { CHANNELS, type Channel } from '../campaign/Channel';
import { Metrics } from '../campaign/Metrics';

export interface ChannelBreakdown {
  channel: Channel;
  campaignCount: number;
  metrics: Metrics;
}

export interface DashboardSummary {
  campaignCount: number;
  activeCount: number;
  totals: Metrics;
  byChannel: ChannelBreakdown[];
  topByRoas: Campaign[];
}

export function rankByRoas(campaigns: readonly Campaign[], limit: number): Campaign[] {
  return campaigns
    .map((campaign) => ({ campaign, roas: campaign.kpis().roas }))
    .filter((entry): entry is { campaign: Campaign; roas: number } => entry.roas !== null)
    .sort((a, b) => b.roas - a.roas || a.campaign.name.localeCompare(b.campaign.name))
    .slice(0, Math.max(0, limit))
    .map((entry) => entry.campaign);
}

export function breakdownByChannel(campaigns: readonly Campaign[]): ChannelBreakdown[] {
  return CHANNELS.map((channel) => {
    const ofChannel = campaigns.filter((campaign) => campaign.channel === channel);
    return {
      channel,
      campaignCount: ofChannel.length,
      metrics: ofChannel.reduce((acc, campaign) => acc.add(campaign.metrics), Metrics.empty()),
    };
  })
    .filter((entry) => entry.campaignCount > 0)
    .sort((a, b) => b.metrics.spend.amount - a.metrics.spend.amount);
}

export function buildDashboardSummary(
  campaigns: readonly Campaign[],
  topLimit: number,
): DashboardSummary {
  return {
    campaignCount: campaigns.length,
    activeCount: campaigns.filter((campaign) => campaign.status === 'ativa').length,
    totals: campaigns.reduce((acc, campaign) => acc.add(campaign.metrics), Metrics.empty()),
    byChannel: breakdownByChannel(campaigns),
    topByRoas: rankByRoas(campaigns, topLimit),
  };
}
