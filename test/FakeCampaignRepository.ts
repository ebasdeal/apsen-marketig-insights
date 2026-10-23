import type { Campaign } from '@domain/campaign/Campaign';
import type { CampaignFilter } from '@domain/campaign/CampaignFilter';
import type { CampaignRepository } from '@domain/campaign/CampaignRepository';

export class FakeCampaignRepository implements CampaignRepository {
  readonly findAllCalls: CampaignFilter[] = [];
  readonly findByIdCalls: string[] = [];

  constructor(private readonly campaigns: Campaign[] = []) {}

  async findAll(filter: CampaignFilter): Promise<Campaign[]> {
    this.findAllCalls.push(filter);
    return this.campaigns;
  }

  async findById(id: string): Promise<Campaign | null> {
    this.findByIdCalls.push(id);
    return this.campaigns.find((campaign) => campaign.id === id) ?? null;
  }
}
