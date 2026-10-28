import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { buildDashboardOverview, DASHBOARD_API } from '@test/fixtures/dashboard';
import { HttpDashboardRepository } from '../HttpDashboardRepository';

const BASE = 'http://localhost:3001';

function repositoryWith(body: unknown) {
  const { fetchFn, calls } = createFakeFetch({ '/dashboard': { body } });
  const http = new FetchHttpClient({ baseUrl: BASE, fetchFn, getToken: () => 'tok' });
  return { repository: new HttpDashboardRepository(http), calls };
}

describe('HttpDashboardRepository', () => {
  it('lê GET /dashboard com Bearer e mapeia categoria/tipo para chave', async () => {
    const { repository, calls } = repositoryWith(DASHBOARD_API);
    await expect(repository.overview()).resolves.toEqual(buildDashboardOverview());
    expect(calls[0]?.url).toBe(`${BASE}/dashboard`);
    expect(new Headers(calls[0]?.init?.headers).get('Authorization')).toBe('Bearer tok');
  });

  it('aceita ciclo ativo nulo', async () => {
    const { repository } = repositoryWith({ ...DASHBOARD_API, cicloAtivo: null });
    await expect(repository.overview()).resolves.toMatchObject({ cicloAtivo: null });
  });

  it('resposta fora do contrato → InvalidResponseError', async () => {
    const { repository } = repositoryWith({ ...DASHBOARD_API, pipeline: { total: -1 } });
    await expect(repository.overview()).rejects.toBeInstanceOf(InvalidResponseError);
  });
});
