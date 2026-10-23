import type { DateRange } from '../shared/DateRange';
import type { Campaign } from './Campaign';
import type { CampaignStatus } from './CampaignStatus';
import type { Channel } from './Channel';

export interface CampaignFilter {
  channel?: Channel;
  status?: CampaignStatus;
  period?: DateRange;
}

export function matchesFilter(campaign: Campaign, filter: CampaignFilter): boolean {
  if (filter.channel !== undefined && campaign.channel !== filter.channel) {
    return false;
  }
  if (filter.status !== undefined && campaign.status !== filter.status) {
    return false;
  }
  if (filter.period !== undefined && !campaign.period.overlaps(filter.period)) {
    return false;
  }
  return true;
}
