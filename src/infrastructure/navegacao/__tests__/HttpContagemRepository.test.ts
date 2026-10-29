import { GetNavBadges } from '@application/navegacao/GetNavBadges';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, findRoute, type FakeRoute } from '@test/fakeFetch';
import { NAV_BADGES_FIXTURE } from '@test/fixtures/navBadges';
import { HttpContagemRepository } from '../HttpContagemRepository';

const BASE = 'http://localhost:3001';

function total(value: number): FakeRoute {
  return { body: [{ id: 1 }], headers: { 'X-Total-Count': String(value) } };
}

const ROUTES: Record<string, FakeRoute> = {
  '/drivers': total(4),
  '/ciclos': total(3),
  '/tipos': total(47),
  '/aprovacoes?status=pendente': total(2),
  '/aprovacoes': total(14),
  '/usuarios': total(4),
  '/agentes': total(5),
  '/analises': total(2),
  '/restricoes?status=ativa': total(8),
  '/restricoes': total(22),
  '/planoItens': total(247),
};

describe('HttpContagemRepository', () => {
  it('lê só o X-Total-Count com _page=1&_limit=1', async () => {
    const { fetchFn, calls } = createFakeFetch(ROUTES);
    const repository = new HttpContagemRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    await expect(repository.contar('aprovacoes', { status: 'pendente' })).resolves.toBe(2);
    await expect(repository.contar('tipos')).resolves.toBe(47);
    expect(calls.map((call) => call.url)).toEqual([
      `${BASE}/aprovacoes?status=pendente&_page=1&_limit=1`,
      `${BASE}/tipos?_page=1&_limit=1`,
    ]);
  });

  it('com GetNavBadges devolve os 9 totais da massa', async () => {
    const { fetchFn, calls } = createFakeFetch(ROUTES);
    const useCase = new GetNavBadges(
      new HttpContagemRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn })),
    );
    await expect(useCase.execute()).resolves.toEqual(NAV_BADGES_FIXTURE);
    expect(calls).toHaveLength(9);
    expect(calls.map((call) => call.url)).toContain(
      `${BASE}/restricoes?status=ativa&_page=1&_limit=1`,
    );
  });

  it('marca como indisponível a contagem sem header', async () => {
    const { fetchFn } = createFakeFetch({ ...ROUTES, '/tipos': { body: [] } });
    const repository = new HttpContagemRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    await expect(repository.contar('tipos')).rejects.toBeInstanceOf(InvalidResponseError);
    const badges = await new GetNavBadges(repository).execute();
    expect(badges.tipos).toBeNull();
    expect(badges.lista).toBe(4);
  });
});

describe('findRoute', () => {
  it('prefere a rota com query mais específica', () => {
    expect(findRoute(ROUTES, `${BASE}/aprovacoes?status=pendente&_page=1`)).toBe(
      ROUTES['/aprovacoes?status=pendente'],
    );
    expect(findRoute(ROUTES, `${BASE}/aprovacoes?_page=1`)).toBe(ROUTES['/aprovacoes']);
    expect(findRoute(ROUTES, `${BASE}/nada`)).toBeUndefined();
  });
});
