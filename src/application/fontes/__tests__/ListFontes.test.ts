import { FONTE_CUSTOM, FONTES_FIXTURE, fonteCard } from '@test/fixtures/fontes';
import { FakeFonteRepository } from '@test/fakes/fonteRepository';
import { ListFonteOptions } from '../ListFonteOptions';
import { ListFontes } from '../ListFontes';

describe('ListFontes (RN-01, RN-02)', () => {
  it('devolve os cards com pill, linha API e removível', async () => {
    const repository = new FakeFonteRepository([...FONTES_FIXTURE, FONTE_CUSTOM]);
    const result = await new ListFontes(repository).execute({ page: 1, size: 10 });
    expect(repository.calls).toEqual([['listPage', { page: 1, size: 10 }]]);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([...FONTES_FIXTURE, FONTE_CUSTOM].map(fonteCard));
    expect(result.items[0]).toMatchObject({ isApi: false, apiLine: null, removivel: false });
    expect(result.items[4]).toMatchObject({
      isApi: true,
      statusLabel: '🔌 API externa ativa',
      apiLine: 'GET https://api.apsen.com.br/v1/distribuidores · auth: bearer · cache: 60min',
      removivel: true,
    });
  });

  it('calcula totalPages pelo tamanho', async () => {
    const fontes = Array.from({ length: 11 }, (_, index) => ({ ...FONTE_CUSTOM, id: `f${index}` }));
    const result = await new ListFontes(new FakeFonteRepository(fontes)).execute({
      page: 2,
      size: 10,
    });
    expect(result.totalPages).toBe(2);
    expect(result.items).toHaveLength(1);
  });
});

describe('ListFonteOptions', () => {
  it('devolve value = id e o rótulo do tipo-form', async () => {
    const options = await new ListFonteOptions(
      new FakeFonteRepository([FONTES_FIXTURE[0] as (typeof FONTES_FIXTURE)[number], FONTE_CUSTOM]),
    ).execute();
    expect(options).toEqual([
      { value: 'concorrentes', label: '🏁 Concorrentes / Marcas (mock)' },
      { value: FONTE_CUSTOM.id, label: '🚚 Distribuidores (API ativa)' },
    ]);
  });
});
