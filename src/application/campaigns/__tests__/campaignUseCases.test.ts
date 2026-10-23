import { CampaignNotFoundError, InvalidValueError } from '@domain/shared/DomainError';
import { buildCampaign } from '@test/factories';
import { FakeCampaignRepository } from '@test/FakeCampaignRepository';
import { GetCampaignDetails } from '../GetCampaignDetails';
import { ListCampaigns, toCampaignFilter } from '../ListCampaigns';
import { PERIOD_PRESETS, resolvePeriodPreset } from '../periodPresets';

describe('toCampaignFilter', () => {
  it('mapeia entrada vazia para filtro vazio', () => {
    expect(toCampaignFilter({})).toEqual({});
  });

  it('mapeia canal, status e período', () => {
    const filter = toCampaignFilter({
      channel: 'meta',
      status: 'ativa',
      period: { start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' },
    });
    expect(filter.channel).toBe('meta');
    expect(filter.status).toBe('ativa');
    expect(filter.period?.days).toBe(31);
  });

  it('propaga erro de período inválido', () => {
    expect(() => toCampaignFilter({ period: { start: '2026-02-01', end: '2026-01-01' } })).toThrow(
      InvalidValueError,
    );
  });
});

describe('ListCampaigns', () => {
  it('consulta o repositório com o filtro e ordena por início mais recente', async () => {
    const repository = new FakeCampaignRepository([
      buildCampaign({
        id: 'old',
        period: ['2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'],
      }),
      buildCampaign({
        id: 'new',
        period: ['2026-05-01T00:00:00.000Z', '2026-05-02T00:00:00.000Z'],
      }),
    ]);
    const result = await new ListCampaigns(repository).execute({ channel: 'google' });
    expect(repository.findAllCalls).toEqual([{ channel: 'google' }]);
    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
    expect(result[0]).toEqual({
      id: 'new',
      name: 'Campanha Teste',
      channel: 'google',
      status: 'ativa',
      periodStart: '2026-05-01T00:00:00.000Z',
      periodEnd: '2026-05-02T00:00:00.000Z',
      budget: 2000,
      spend: 1000,
      revenue: 4000,
      roas: 4,
    });
  });

  it('usa entrada vazia por padrão', async () => {
    const repository = new FakeCampaignRepository();
    await expect(new ListCampaigns(repository).execute()).resolves.toEqual([]);
    expect(repository.findAllCalls).toEqual([{}]);
  });
});

describe('GetCampaignDetails', () => {
  it('retorna detalhe com KPIs e orçamento', async () => {
    const repository = new FakeCampaignRepository([
      buildCampaign({ id: 'x', budget: 800, metrics: { spend: 1000 } }),
    ]);
    const details = await new GetCampaignDetails(repository).execute('x');
    expect(details.durationDays).toBe(31);
    expect(details.metrics).toEqual({
      impressions: 10000,
      clicks: 500,
      conversions: 50,
      spend: 1000,
      revenue: 4000,
    });
    expect(details.kpis).toEqual({ ctr: 5, cpc: 2, cpa: 20, roas: 4, conversionRate: 10 });
    expect(details.budgetUsage).toBe(125);
    expect(details.overBudget).toBe(true);
  });

  it('retorna KPIs nulos e orçamento indefinido quando não há base', async () => {
    const repository = new FakeCampaignRepository([
      buildCampaign({
        id: 'z',
        budget: 0,
        metrics: { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 },
      }),
    ]);
    const details = await new GetCampaignDetails(repository).execute('z');
    expect(details.kpis).toEqual({
      ctr: null,
      cpc: null,
      cpa: null,
      roas: null,
      conversionRate: null,
    });
    expect(details.budgetUsage).toBeNull();
  });

  it('lança CampaignNotFoundError quando não existe', async () => {
    const useCase = new GetCampaignDetails(new FakeCampaignRepository());
    await expect(useCase.execute('nope')).rejects.toBeInstanceOf(CampaignNotFoundError);
  });
});

describe('resolvePeriodPreset', () => {
  const now = new Date('2026-10-22T15:00:00.000Z');

  it('expõe todos os presets', () => {
    expect(PERIOD_PRESETS).toEqual(['all', '30d', '90d', 'ytd']);
  });

  it('resolve cada preset', () => {
    expect(resolvePeriodPreset('all', now)).toBeUndefined();
    expect(resolvePeriodPreset('30d', now)).toEqual({
      start: '2026-09-23T15:00:00.000Z',
      end: '2026-10-22T15:00:00.000Z',
    });
    expect(resolvePeriodPreset('90d', now)?.start).toBe('2026-07-25T15:00:00.000Z');
    expect(resolvePeriodPreset('ytd', now)).toEqual({
      start: '2026-01-01T00:00:00.000Z',
      end: '2026-10-22T15:00:00.000Z',
    });
  });
});
