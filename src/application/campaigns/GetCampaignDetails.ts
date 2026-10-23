import type { CampaignRepository } from '@domain/campaign/CampaignRepository';
import { CampaignNotFoundError } from '@domain/shared/DomainError';
import type { CampaignDetailsOutput } from './dto';
import { toCampaignDetails } from './mappers';

export class GetCampaignDetails {
  constructor(private readonly repository: CampaignRepository) {}

  async execute(id: string): Promise<CampaignDetailsOutput> {
    const campaign = await this.repository.findById(id);
    if (campaign === null) {
      throw new CampaignNotFoundError(id);
    }
    return toCampaignDetails(campaign);
  }
}
