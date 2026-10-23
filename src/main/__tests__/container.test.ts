import { createMockCampaignDtos } from '@infrastructure/campaigns/mockCampaigns';
import { createFakeFetch } from '@test/fakeFetch';
import { createContainer, createContainerFromProcessEnv } from '../container';

describe('createContainer', () => {
  const now = () => new Date('2026-10-22T12:00:00.000Z');

  it('usa repositório mock quando não há URL da API', async () => {
    const container = createContainer({ apiUrl: undefined, mockLatencyMs: 0 }, { now });
    expect(container.dataSource).toBe('mock');
    const campaigns = await container.useCases.listCampaigns.execute({ channel: 'email' });
    expect(campaigns.length).toBeGreaterThan(0);
    expect(campaigns.every((campaign) => campaign.channel === 'email')).toBe(true);
    const details = await container.useCases.getCampaignDetails.execute('cmp-001');
    expect(details.name).toBe('Black Friday – Search Marca');
    const summary = await container.useCases.getDashboardSummary.execute();
    expect(summary.campaignCount).toBe(14);
    expect(summary.topCampaigns.length).toBeGreaterThan(0);
  });

  it('usa repositório HTTP quando há URL da API', async () => {
    const [first] = createMockCampaignDtos(now());
    const { fetchFn, calls } = createFakeFetch({ '/v1/campaigns': { body: { data: [first] } } });
    const container = createContainer(
      { apiUrl: 'https://api.exemplo.com/v1', mockLatencyMs: 0 },
      { fetchFn },
    );
    expect(container.dataSource).toBe('http');
    const campaigns = await container.useCases.listCampaigns.execute();
    expect(campaigns.map((campaign) => campaign.id)).toEqual(['cmp-001']);
    expect(calls[0]?.url).toBe('https://api.exemplo.com/v1/campaigns');
  });

  it('usa fetch global e relógio real por padrão', () => {
    expect(
      createContainer({ apiUrl: 'https://api.exemplo.com', mockLatencyMs: 0 }).dataSource,
    ).toBe('http');
    expect(createContainer({ apiUrl: undefined, mockLatencyMs: 0 }).dataSource).toBe('mock');
  });
});

describe('createContainerFromProcessEnv', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('lê variáveis de ambiente públicas', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.exemplo.com';
    expect(createContainerFromProcessEnv().dataSource).toBe('http');
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(createContainerFromProcessEnv().dataSource).toBe('mock');
  });
});
