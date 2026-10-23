import { buildCampaign } from '@test/factories';
import { InMemoryCampaignRepository, defaultSleep } from '../InMemoryCampaignRepository';
import { campaignDtoSchema } from '../campaignDto';
import { createMockCampaignDtos, createMockCampaigns } from '../mockCampaigns';

describe('InMemoryCampaignRepository', () => {
  const campaigns = [
    buildCampaign({ id: 'a', channel: 'google' }),
    buildCampaign({ id: 'b', channel: 'meta', status: 'pausada' }),
  ];

  it('filtra campanhas sem latência por padrão', async () => {
    const sleep = vi.fn();
    const repository = new InMemoryCampaignRepository(campaigns, { sleep });
    const result = await repository.findAll({ channel: 'meta' });
    expect(result.map((c) => c.id)).toEqual(['b']);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('busca por id e retorna null quando não existe', async () => {
    const repository = new InMemoryCampaignRepository(campaigns);
    await expect(repository.findById('a')).resolves.toBe(campaigns[0]);
    await expect(repository.findById('zzz')).resolves.toBeNull();
  });

  it('simula latência configurável', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const repository = new InMemoryCampaignRepository(campaigns, { latencyMs: 250, sleep });
    await repository.findAll({});
    await repository.findById('a');
    expect(sleep).toHaveBeenNthCalledWith(1, 250);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it('defaultSleep aguarda o tempo informado', async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    const promise = defaultSleep(100).then(done);
    vi.advanceTimersByTime(99);
    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    await promise;
    expect(done).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('mockCampaigns', () => {
  const reference = new Date('2026-10-22T18:30:00.000Z');

  it('gera DTOs válidos pelo contrato relativos à data de referência', () => {
    const dtos = createMockCampaignDtos(reference);
    expect(dtos.length).toBeGreaterThanOrEqual(10);
    dtos.forEach((dto) => expect(campaignDtoSchema.safeParse(dto).success).toBe(true));
    const first = dtos[0];
    expect(first?.period.start).toBe('2026-10-02T00:00:00.000Z');
    expect(new Set(dtos.map((dto) => dto.channel)).size).toBe(5);
    expect(new Set(dtos.map((dto) => dto.id)).size).toBe(dtos.length);
  });

  it('gera entidades de domínio consistentes', () => {
    const entities = createMockCampaigns(reference);
    expect(entities.some((c) => c.kpis().roas === null)).toBe(true);
    expect(entities.some((c) => c.isOverBudget())).toBe(true);
  });
});
