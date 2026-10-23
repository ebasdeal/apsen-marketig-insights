import type { CampaignFilter } from '@domain/campaign/CampaignFilter';
import type { CampaignRepository } from '@domain/campaign/CampaignRepository';
import { DateRange } from '@domain/shared/DateRange';
import type { CampaignListItemOutput, ListCampaignsInput } from './dto';
import { toCampaignListItem } from './mappers';

export function toCampaignFilter(input: ListCampaignsInput): CampaignFilter {
  const filter: CampaignFilter = {};
  if (input.channel !== undefined) {
    filter.channel = input.channel;
  }
  if (input.status !== undefined) {
    filter.status = input.status;
  }
  if (input.period !== undefined) {
    filter.period = DateRange.fromIso(input.period.start, input.period.end);
  }
  return filter;
}

export class ListCampaigns {
  constructor(private readonly repository: CampaignRepository) {}

  async execute(input: ListCampaignsInput = {}): Promise<CampaignListItemOutput[]> {
    const campaigns = await this.repository.findAll(toCampaignFilter(input));
    return [...campaigns]
      .sort((a, b) => b.period.start.getTime() - a.period.start.getTime())
      .map(toCampaignListItem);
  }
}
