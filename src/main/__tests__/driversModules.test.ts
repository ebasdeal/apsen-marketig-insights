import { createFakeFetch } from '@test/fakeFetch';
import { createContainer } from '../container';
import { createCatalogoModule } from '../modules/catalogo';
import { createDriversModule } from '../modules/drivers';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { DRIVER_API_3 } from '@infrastructure/drivers/__tests__/driverApiFixtures';

const ENV = { apiUrl: 'http://localhost:3001', authMode: 'simulado' as const };
const sso = { redirecionarParaLogin: vi.fn(), redirecionarParaLogout: vi.fn() };

const CONFIG = {
  LABEL: {},
  opcoes: { regioes: [], canais: [], canaisDefault: [] },
  exportSchema: 'drivers-demanda-farma-v2.1',
  instrucoes_modelagem: ['x'],
};

describe('módulos drivers e catalogo', () => {
  it('o container registra os dois módulos sobre o HTTP com token', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/drivers/3': { body: DRIVER_API_3 },
      '/skus': { body: [] },
    });
    const { useCases } = createContainer(ENV, { fetchFn, sso });
    const dto = await useCases.drivers.getForForm.execute('3');
    expect(dto).toMatchObject({ driver: { id: '3' }, sku: null, familia: null });
    expect(calls.map((call) => call.url)).toEqual([
      'http://localhost:3001/drivers/3',
      'http://localhost:3001/skus/LEVOXIN%20500MG%20-%207%20COMP.%20(2300)',
      'http://localhost:3001/skus?q=2300&_limit=1',
    ]);
    expect(calls[0]?.init?.headers).toMatchObject({ Authorization: 'Bearer tok-admin' });
    expect(Object.keys(useCases.catalogo)).toEqual([
      'searchSkus',
      'searchFamilias',
      'familiaSkus',
      'franquiaSkus',
      'listFamilias',
      'filters',
      'familiaDrivers',
    ]);
  });

  it('createDriversModule usa o clock no export', async () => {
    const { fetchFn } = createFakeFetch({
      '/drivers': { body: [DRIVER_API_3] },
      '/config': { body: CONFIG },
    });
    const http = new FetchHttpClient({ baseUrl: ENV.apiUrl, fetchFn });
    const drivers = createDriversModule(http, () => new Date('2026-10-27T00:00:00.000Z'));
    await expect(drivers.export.execute()).resolves.toMatchObject({
      nomeArquivo: 'drivers_demanda_v2_2026-10-27.json',
      total: 1,
    });
    const padrao = await createDriversModule(http).export.execute();
    expect(padrao.nomeArquivo).toMatch(/^drivers_demanda_v2_\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('createCatalogoModule lê os filtros pelo /franquias', async () => {
    const { fetchFn } = createFakeFetch({
      '/franquias': { body: [{ id: 'LYRA', familias: ['B', 'A'] }] },
    });
    const catalogo = createCatalogoModule(new FetchHttpClient({ baseUrl: ENV.apiUrl, fetchFn }));
    await expect(catalogo.filters.execute()).resolves.toEqual({
      franquias: ['LYRA'],
      familiasPorFranquia: { LYRA: ['A', 'B'] },
    });
  });
});
