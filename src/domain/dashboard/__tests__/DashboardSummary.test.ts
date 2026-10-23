import { buildCampaign } from '@test/factories';
import { breakdownByChannel, buildDashboardSummary, rankByRoas } from '../DashboardSummary';

const campaigns = [
  buildCampaign({
    id: 'a',
    name: 'Alfa',
    channel: 'google',
    metrics: { spend: 1000, revenue: 5000 },
  }),
  buildCampaign({
    id: 'b',
    name: 'Beta',
    channel: 'meta',
    status: 'pausada',
    metrics: { spend: 3000, revenue: 6000 },
  }),
  buildCampaign({
    id: 'c',
    name: 'Gama',
    channel: 'google',
    status: 'encerrada',
    metrics: { spend: 500, revenue: 1000 },
  }),
  buildCampaign({
    id: 'd',
    name: 'Delta',
    channel: 'tiktok',
    metrics: { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
  }),
  buildCampaign({
    id: 'e',
    name: 'Épsilon',
    channel: 'email',
    metrics: { spend: 1000, revenue: 2000 },
  }),
];

describe('rankByRoas', () => {
  it('ordena por ROAS desc, desempata por nome e ignora ROAS indefinido', () => {
    expect(rankByRoas(campaigns, 10).map((c) => c.id)).toEqual(['a', 'b', 'e', 'c']);
  });

  it('respeita o limite e trata limite negativo', () => {
    expect(rankByRoas(campaigns, 2).map((c) => c.id)).toEqual(['a', 'b']);
    expect(rankByRoas(campaigns, -1)).toEqual([]);
  });
});

describe('breakdownByChannel', () => {
  it('agrupa por canal, omite canais vazios e ordena por investimento', () => {
    const breakdown = breakdownByChannel(campaigns);
    expect(breakdown.map((entry) => entry.channel)).toEqual(['meta', 'google', 'email', 'tiktok']);
    const google = breakdown.find((entry) => entry.channel === 'google');
    expect(google?.campaignCount).toBe(2);
    expect(google?.metrics.spend.amount).toBe(1500);
    expect(google?.metrics.revenue.amount).toBe(6000);
  });
});

describe('buildDashboardSummary', () => {
  it('consolida totais, ativos, canais e ranking', () => {
    const summary = buildDashboardSummary(campaigns, 3);
    expect(summary.campaignCount).toBe(5);
    expect(summary.activeCount).toBe(3);
    expect(summary.totals.spend.amount).toBe(5500);
    expect(summary.totals.revenue.amount).toBe(14000);
    expect(summary.byChannel).toHaveLength(4);
    expect(summary.topByRoas.map((c) => c.id)).toEqual(['a', 'b', 'e']);
  });

  it('lida com lista vazia', () => {
    const summary = buildDashboardSummary([], 5);
    expect(summary.campaignCount).toBe(0);
    expect(summary.totals.kpis().roas).toBeNull();
    expect(summary.byChannel).toEqual([]);
    expect(summary.topByRoas).toEqual([]);
  });
});
