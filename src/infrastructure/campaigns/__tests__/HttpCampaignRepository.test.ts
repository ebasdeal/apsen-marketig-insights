import { DateRange } from '@domain/shared/DateRange';
import { createFakeFetch } from '@test/fakeFetch';
import { FetchHttpClient } from '../../http/FetchHttpClient';
import { HttpError, InvalidResponseError, type HttpClient } from '../../http/HttpClient';
import type { CampaignDto } from '../campaignDto';
import { HttpCampaignRepository } from '../HttpCampaignRepository';

const dto: CampaignDto = {
  id: 'cmp-1',
  name: 'Search Marca',
  channel: 'google',
  status: 'ativa',
  period: { start: '2026-01-01T00:00:00.000Z', end: '2026-01-31T00:00:00.000Z' },
  budget: 5000,
  metrics: { impressions: 1000, clicks: 100, conversions: 10, spend: 400, revenue: 2000 },
};

function createRepository(routes: Parameters<typeof createFakeFetch>[0]) {
  const { fetchFn, calls } = createFakeFetch(routes);
  const repository = new HttpCampaignRepository(
    new FetchHttpClient({ baseUrl: 'https://api.exemplo.com', fetchFn }),
  );
  return { repository, calls };
}

describe('HttpCampaignRepository.findAll', () => {
  it('envia filtros como query e mapeia DTOs para entidades', async () => {
    const { repository, calls } = createRepository({ '/campaigns': { body: { data: [dto] } } });
    const campaigns = await repository.findAll({
      channel: 'google',
      status: 'ativa',
      period: DateRange.fromIso('2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z'),
    });

    expect(calls[0]?.url).toBe(
      'https://api.exemplo.com/campaigns?channel=google&status=ativa&from=2026-01-01T00%3A00%3A00.000Z&to=2026-02-01T00%3A00%3A00.000Z',
    );
    expect(campaigns).toHaveLength(1);
    expect(campaigns[0]?.name).toBe('Search Marca');
    expect(campaigns[0]?.kpis().roas).toBe(5);
  });

  it('não envia query quando o filtro é vazio', async () => {
    const { repository, calls } = createRepository({ '/campaigns': { body: { data: [] } } });
    await expect(repository.findAll({})).resolves.toEqual([]);
    expect(calls[0]?.url).toBe('https://api.exemplo.com/campaigns');
  });

  it.each([
    [null, '(raiz)'],
    [{ items: [] }, 'data'],
    [{ data: [{ ...dto, channel: 'orkut' }] }, 'data.0.channel'],
    [
      { data: [{ ...dto, period: { start: 'ontem', end: dto.period.end } }] },
      'data.0.period.start',
    ],
    [{ data: [{ ...dto, metrics: { ...dto.metrics, clicks: -1 } }] }, 'data.0.metrics.clicks'],
  ])('rejeita payload fora do contrato %#', async (body, path) => {
    const { repository } = createRepository({ '/campaigns': { body } });
    const error = await repository.findAll({}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(InvalidResponseError);
    expect((error as Error).message).toContain(path);
  });

  it('rejeita dados que violam regras de domínio', async () => {
    const { repository } = createRepository({
      '/campaigns': { body: { data: [{ ...dto, metrics: { ...dto.metrics, clicks: 5000 } }] } },
    });
    await expect(repository.findAll({})).rejects.toThrow(
      'Campanha cmp-1 inconsistente: Cliques não podem exceder impressões',
    );
  });

  it('propaga erros HTTP', async () => {
    const { repository } = createRepository({ '/campaigns': { status: 503, body: {} } });
    await expect(repository.findAll({})).rejects.toBeInstanceOf(HttpError);
  });
});

describe('HttpCampaignRepository.findById', () => {
  it('busca por id com encoding', async () => {
    const { repository, calls } = createRepository({ '/campaigns/cmp%201': { body: dto } });
    const campaign = await repository.findById('cmp 1');
    expect(calls[0]?.url).toBe('https://api.exemplo.com/campaigns/cmp%201');
    expect(campaign?.id).toBe('cmp-1');
  });

  it('retorna null em 404', async () => {
    const { repository } = createRepository({});
    await expect(repository.findById('x')).resolves.toBeNull();
  });

  it('propaga outros erros HTTP e de contrato', async () => {
    const failing = createRepository({ '/campaigns/x': { status: 500, body: {} } });
    await expect(failing.repository.findById('x')).rejects.toMatchObject({ status: 500 });

    const invalid = createRepository({ '/campaigns/x': { body: { id: 'x' } } });
    await expect(invalid.repository.findById('x')).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('propaga erros inesperados do mapeamento', async () => {
    const http: HttpClient = { get: vi.fn().mockResolvedValue({ data: [dto] }) };
    const repository = new HttpCampaignRepository(http);
    const spy = vi.spyOn(DateRange, 'fromIso').mockImplementation(() => {
      throw new RangeError('inesperado');
    });
    await expect(repository.findAll({})).rejects.toBeInstanceOf(RangeError);
    spy.mockRestore();
  });
});
