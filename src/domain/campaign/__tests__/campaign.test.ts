import { buildCampaign, buildMetrics } from '@test/factories';
import { InvalidValueError } from '../../shared/DomainError';
import { DateRange } from '../../shared/DateRange';
import { Money } from '../../shared/Money';
import { matchesFilter } from '../CampaignFilter';
import { isCampaignStatus } from '../CampaignStatus';
import { isChannel } from '../Channel';
import { Metrics } from '../Metrics';

describe('Metrics', () => {
  it('calcula CTR, CPC, CPA, ROAS e taxa de conversão', () => {
    const metrics = buildMetrics({
      impressions: 20000,
      clicks: 400,
      conversions: 20,
      spend: 1000,
      revenue: 3500,
    });
    expect(metrics.ctr()?.value).toBe(2);
    expect(metrics.cpc()?.amount).toBe(2.5);
    expect(metrics.cpa()?.amount).toBe(50);
    expect(metrics.roas()).toBe(3.5);
    expect(metrics.conversionRate()?.value).toBe(5);
  });

  it('retorna null em KPIs com divisão por zero', () => {
    const kpis = Metrics.empty().kpis();
    expect(kpis).toEqual({ ctr: null, cpc: null, cpa: null, roas: null, conversionRate: null });
  });

  it('CPA indefinido sem conversões, mas CTR definido', () => {
    const kpis = buildMetrics({ impressions: 100, clicks: 10, conversions: 0 }).kpis();
    expect(kpis.cpa).toBeNull();
    expect(kpis.conversionRate?.value).toBe(0);
    expect(kpis.ctr?.value).toBe(10);
  });

  it('soma métricas', () => {
    const total = buildMetrics().add(buildMetrics());
    expect(total.impressions).toBe(20000);
    expect(total.clicks).toBe(1000);
    expect(total.conversions).toBe(100);
    expect(total.spend.amount).toBe(2000);
    expect(total.revenue.amount).toBe(8000);
  });

  it.each([
    [{ impressions: -1 }, 'Impressões'],
    [{ impressions: 1.5 }, 'Impressões'],
    [{ clicks: -1 }, 'Cliques'],
    [{ conversions: 2.2 }, 'Conversões'],
    [{ impressions: 10, clicks: 11 }, 'Cliques não podem exceder impressões'],
    [{ clicks: 10, conversions: 11 }, 'Conversões não podem exceder cliques'],
  ])('rejeita métricas inconsistentes %p', (override, message) => {
    expect(() =>
      Metrics.create({
        impressions: 100,
        clicks: 10,
        conversions: 1,
        spend: Money.zero(),
        revenue: Money.zero(),
        ...override,
      }),
    ).toThrow(message);
  });
});

describe('Campaign', () => {
  it('normaliza id e nome e expõe propriedades', () => {
    const campaign = buildCampaign({ id: '  cmp-7 ', name: ' Verão ', channel: 'meta' });
    expect(campaign.id).toBe('cmp-7');
    expect(campaign.name).toBe('Verão');
    expect(campaign.channel).toBe('meta');
    expect(campaign.status).toBe('ativa');
    expect(campaign.budget.amount).toBe(2000);
    expect(campaign.period.days).toBe(31);
    expect(campaign.kpis().roas).toBe(4);
  });

  it('exige id e nome', () => {
    expect(() => buildCampaign({ id: ' ' })).toThrow(InvalidValueError);
    expect(() => buildCampaign({ name: '' })).toThrow('Campanha precisa de um nome');
  });

  it('calcula uso do orçamento e estouro', () => {
    expect(buildCampaign({ budget: 2000, metrics: { spend: 1000 } }).budgetUsage()?.value).toBe(50);
    expect(buildCampaign({ budget: 2000, metrics: { spend: 1000 } }).isOverBudget()).toBe(false);
    expect(buildCampaign({ budget: 1000, metrics: { spend: 1000 } }).isOverBudget()).toBe(false);
    expect(buildCampaign({ budget: 500, metrics: { spend: 1000 } }).isOverBudget()).toBe(true);
  });

  it('uso do orçamento é indefinido com orçamento zero', () => {
    const campaign = buildCampaign({ budget: 0 });
    expect(campaign.budgetUsage()).toBeNull();
    expect(campaign.isOverBudget()).toBe(false);
  });
});

describe('type guards', () => {
  it('reconhece canais e status válidos', () => {
    expect(isChannel('tiktok')).toBe(true);
    expect(isChannel('orkut')).toBe(false);
    expect(isChannel(1)).toBe(false);
    expect(isCampaignStatus('pausada')).toBe(true);
    expect(isCampaignStatus('rascunho')).toBe(false);
    expect(isCampaignStatus(null)).toBe(false);
  });
});

describe('matchesFilter', () => {
  const campaign = buildCampaign({
    channel: 'linkedin',
    status: 'pausada',
    period: ['2026-03-01T00:00:00.000Z', '2026-03-31T00:00:00.000Z'],
  });

  it('aceita filtro vazio', () => {
    expect(matchesFilter(campaign, {})).toBe(true);
  });

  it('filtra por canal, status e período', () => {
    expect(matchesFilter(campaign, { channel: 'linkedin' })).toBe(true);
    expect(matchesFilter(campaign, { channel: 'google' })).toBe(false);
    expect(matchesFilter(campaign, { status: 'pausada' })).toBe(true);
    expect(matchesFilter(campaign, { status: 'ativa' })).toBe(false);
    expect(
      matchesFilter(campaign, {
        period: DateRange.fromIso('2026-03-15T00:00:00.000Z', '2026-04-15T00:00:00.000Z'),
      }),
    ).toBe(true);
    expect(
      matchesFilter(campaign, {
        period: DateRange.fromIso('2026-04-01T00:00:00.000Z', '2026-04-15T00:00:00.000Z'),
      }),
    ).toBe(false);
  });
});
