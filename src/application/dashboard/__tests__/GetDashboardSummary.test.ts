import { buildCampaign } from '@test/factories';
import { FakeCampaignRepository } from '@test/FakeCampaignRepository';
import { DEFAULT_TOP_LIMIT, GetDashboardSummary } from '../GetDashboardSummary';

describe('GetDashboardSummary', () => {
  const campaigns = [
    buildCampaign({ id: 'a', channel: 'google', metrics: { spend: 1000, revenue: 5000 } }),
    buildCampaign({
      id: 'b',
      channel: 'meta',
      status: 'pausada',
      metrics: { spend: 3000, revenue: 6000 },
    }),
    buildCampaign({ id: 'c', channel: 'google', metrics: { spend: 1000, revenue: 1000 } }),
  ];

  it('consolida totais, KPIs, canais e top campanhas', async () => {
    const repository = new FakeCampaignRepository(campaigns);
    const result = await new GetDashboardSummary(repository, 2).execute({
      period: { start: '2026-01-01T00:00:00.000Z', end: '2026-12-31T00:00:00.000Z' },
    });

    expect(repository.findAllCalls[0]?.period?.days).toBe(365);
    expect(result.campaignCount).toBe(3);
    expect(result.activeCount).toBe(2);
    expect(result.totals.spend).toBe(5000);
    expect(result.totals.revenue).toBe(12000);
    expect(result.kpis.roas).toBe(2.4);
    expect(result.byChannel.map((entry) => entry.channel)).toEqual(['meta', 'google']);
    expect(result.byChannel[0]?.spendShare).toBe(0.6);
    expect(result.byChannel[1]?.kpis.roas).toBe(3);
    expect(result.topCampaigns.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('usa limite padrão e entrada vazia', async () => {
    const many = Array.from({ length: 8 }, (_, index) =>
      buildCampaign({ id: `c${index}`, name: `Campanha ${index}` }),
    );
    const repository = new FakeCampaignRepository(many);
    const result = await new GetDashboardSummary(repository).execute();
    expect(repository.findAllCalls).toEqual([{}]);
    expect(result.topCampaigns).toHaveLength(DEFAULT_TOP_LIMIT);
  });

  it('participação de investimento é nula quando o total é zero', async () => {
    const repository = new FakeCampaignRepository([
      buildCampaign({
        metrics: { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
      }),
    ]);
    const result = await new GetDashboardSummary(repository).execute({});
    expect(result.byChannel[0]?.spendShare).toBeNull();
    expect(result.topCampaigns).toEqual([]);
  });
});
