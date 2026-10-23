import { GetCampaignDetails } from '@application/campaigns/GetCampaignDetails';
import { ListCampaigns } from '@application/campaigns/ListCampaigns';
import { GetDashboardSummary } from '@application/dashboard/GetDashboardSummary';
import type { CampaignRepository } from '@domain/campaign/CampaignRepository';
import { HttpCampaignRepository } from '@infrastructure/campaigns/HttpCampaignRepository';
import { InMemoryCampaignRepository } from '@infrastructure/campaigns/InMemoryCampaignRepository';
import { createMockCampaigns } from '@infrastructure/campaigns/mockCampaigns';
import { parseEnv, readProcessEnv, type AppEnv } from '@infrastructure/config/env';
import { FetchHttpClient, type FetchFn } from '@infrastructure/http/FetchHttpClient';
import type { UseCases } from '@presentation/providers/UseCasesContext';

export type DataSource = 'http' | 'mock';

export interface Container {
  dataSource: DataSource;
  useCases: UseCases;
}

export interface ContainerOverrides {
  fetchFn?: FetchFn;
  now?: () => Date;
}

function createRepository(env: AppEnv, overrides: ContainerOverrides): CampaignRepository {
  if (env.apiUrl !== undefined) {
    const options = overrides.fetchFn === undefined ? {} : { fetchFn: overrides.fetchFn };
    return new HttpCampaignRepository(new FetchHttpClient({ baseUrl: env.apiUrl, ...options }));
  }
  const now = overrides.now ?? (() => new Date());
  return new InMemoryCampaignRepository(createMockCampaigns(now()), {
    latencyMs: env.mockLatencyMs,
  });
}

export function createContainer(env: AppEnv, overrides: ContainerOverrides = {}): Container {
  const repository = createRepository(env, overrides);
  return {
    dataSource: env.apiUrl === undefined ? 'mock' : 'http',
    useCases: {
      listCampaigns: new ListCampaigns(repository),
      getCampaignDetails: new GetCampaignDetails(repository),
      getDashboardSummary: new GetDashboardSummary(repository),
    },
  };
}

export function createContainerFromProcessEnv(): Container {
  return createContainer(parseEnv(readProcessEnv()));
}
