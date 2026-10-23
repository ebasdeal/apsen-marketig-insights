import type { Campaign } from './Campaign';
import type { CampaignFilter } from './CampaignFilter';

export interface CampaignRepository {
  findAll(filter: CampaignFilter): Promise<Campaign[]>;
  findById(id: string): Promise<Campaign | null>;
}
