import type { Campaign } from '@domain/campaign/Campaign';
import type { CampaignFilter } from '@domain/campaign/CampaignFilter';
import type { CampaignRepository } from '@domain/campaign/CampaignRepository';
import { HttpError, type HttpClient } from '../http/HttpClient';
import { campaignDtoSchema, campaignListResponseSchema } from './campaignDto';
import { parseWith, toCampaign } from './campaignMapper';

export class HttpCampaignRepository implements CampaignRepository {
  constructor(private readonly http: HttpClient) {}

  async findAll(filter: CampaignFilter): Promise<Campaign[]> {
    const payload = await this.http.get('/campaigns', {
      query: {
        channel: filter.channel,
        status: filter.status,
        from: filter.period?.start.toISOString(),
        to: filter.period?.end.toISOString(),
      },
    });
    const response = parseWith(campaignListResponseSchema, payload, 'GET /campaigns');
    return response.data.map(toCampaign);
  }

  async findById(id: string): Promise<Campaign | null> {
    try {
      const payload = await this.http.get(`/campaigns/${encodeURIComponent(id)}`);
      return toCampaign(parseWith(campaignDtoSchema, payload, 'GET /campaigns/{id}'));
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
