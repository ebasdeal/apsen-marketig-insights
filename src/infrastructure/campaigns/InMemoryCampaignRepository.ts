import type { Campaign } from '@domain/campaign/Campaign';
import { matchesFilter, type CampaignFilter } from '@domain/campaign/CampaignFilter';
import type { CampaignRepository } from '@domain/campaign/CampaignRepository';

export type Sleep = (ms: number) => Promise<void>;

export const defaultSleep: Sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export interface InMemoryCampaignRepositoryOptions {
  latencyMs?: number;
  sleep?: Sleep;
}

export class InMemoryCampaignRepository implements CampaignRepository {
  private readonly latencyMs: number;
  private readonly sleep: Sleep;

  constructor(
    private readonly campaigns: readonly Campaign[],
    options: InMemoryCampaignRepositoryOptions = {},
  ) {
    this.latencyMs = options.latencyMs ?? 0;
    this.sleep = options.sleep ?? defaultSleep;
  }

  async findAll(filter: CampaignFilter): Promise<Campaign[]> {
    await this.delay();
    return this.campaigns.filter((campaign) => matchesFilter(campaign, filter));
  }

  async findById(id: string): Promise<Campaign | null> {
    await this.delay();
    return this.campaigns.find((campaign) => campaign.id === id) ?? null;
  }

  private async delay(): Promise<void> {
    if (this.latencyMs > 0) {
      await this.sleep(this.latencyMs);
    }
  }
}
