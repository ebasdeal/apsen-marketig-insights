import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { makeDriver } from '@test/factories/drivers';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { CryptoIdGenerator } from '../CryptoIdGenerator';
import { toDriverDto } from '../driverMapper';
import { HttpDriverRepository } from '../HttpDriverRepository';
import { DRIVER_API_3 } from './driverApiFixtures';

const BASE = 'http://localhost:3001';

function repositoryFor(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  return {
    repository: new HttpDriverRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn })),
    calls,
  };
}

describe('HttpDriverRepository — get/create/update (registrar-driver §4.1)', () => {
  it('GET /drivers/{id} converte id e parâmetros numéricos em texto', async () => {
    const { repository, calls } = repositoryFor({ '/drivers/3': { body: DRIVER_API_3 } });
    const driver = await repository.get('3');
    expect(calls[0]?.url).toBe(`${BASE}/drivers/3`);
    expect(driver).toEqual(
      makeDriver({ parametros: { preco_novo: '42.90', variacao_pct: '6.5' } }),
    );
  });

  it('404 → NotFoundError; outros erros sobem como estão', async () => {
    const { repository } = repositoryFor({ '/drivers/500': { status: 500, body: {} } });
    await expect(repository.get('x')).rejects.toBeInstanceOf(NotFoundError);
    await expect(repository.get('500')).rejects.toBeInstanceOf(HttpError);
  });

  it('payload fora do contrato → InvalidResponseError com o campo', async () => {
    const { repository } = repositoryFor({
      '/drivers/3': { body: { ...DRIVER_API_3, intensidade_esperada: 7 } },
    });
    await expect(repository.get('3')).rejects.toThrow(
      new InvalidResponseError('Resposta de /drivers/3 fora do contrato: intensidade_esperada'),
    );
  });

  it('POST /drivers com o corpo na ordem do protótipo', async () => {
    const http = createFakeHttpClient({ post: async (_path, body) => body });
    const driver = makeDriver({ id: 'uuid-1' });
    await expect(new HttpDriverRepository(http).create(driver)).resolves.toEqual(driver);
    expect(http.post).toHaveBeenCalledWith('/drivers', toDriverDto(driver));
    const body = http.post.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(Object.keys(body)[0]).toBe('id');
    expect(Object.keys(body).at(-1)).toBe('parametros');
  });

  it('PUT /drivers/{id} codificado; 404 → NotFoundError', async () => {
    const http = createFakeHttpClient({ put: async (_path, body) => body });
    const driver = makeDriver({ id: 'a b' });
    await new HttpDriverRepository(http).update(driver);
    expect(http.put).toHaveBeenCalledWith('/drivers/a%20b', toDriverDto(driver));
    const { repository, calls } = repositoryFor({ '/drivers/3': { body: DRIVER_API_3 } });
    await repository.update(makeDriver());
    expect(calls[0]?.init?.method).toBe('PUT');
    expect(calls[0]?.url).toBe(`${BASE}/drivers/3`);
    await expect(repository.update(makeDriver({ id: '9' }))).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('HttpDriverRepository — list/listAll/remove (meus-registros §4)', () => {
  it('lista paginada com _page/_limit e X-Total-Count', async () => {
    const { repository, calls } = repositoryFor({
      '/drivers': { body: [DRIVER_API_3], headers: { 'X-Total-Count': '4' } },
    });
    const page = await repository.list({ page: 1, limit: 10 });
    expect(calls[0]?.url).toBe(`${BASE}/drivers?_page=1&_limit=10`);
    expect(page).toMatchObject({ total: 4, page: 1, limit: 10 });
    expect(page.items[0]?.id).toBe('3');
  });

  it('sem X-Total-Count → InvalidResponseError', async () => {
    const { repository } = repositoryFor({ '/drivers': { body: [DRIVER_API_3] } });
    await expect(repository.list({ page: 1, limit: 10 })).rejects.toBeInstanceOf(
      InvalidResponseError,
    );
  });

  it('listAll lê a coleção inteira', async () => {
    const { repository, calls } = repositoryFor({ '/drivers': { body: [DRIVER_API_3] } });
    await expect(repository.listAll()).resolves.toHaveLength(1);
    expect(calls[0]?.url).toBe(`${BASE}/drivers`);
  });

  it('DELETE /drivers/{id}; 404 → NotFoundError', async () => {
    const { repository, calls } = repositoryFor({ '/drivers/1': { body: {} } });
    await expect(repository.remove('1')).resolves.toBeUndefined();
    expect(calls[0]?.init?.method).toBe('DELETE');
    await expect(repository.remove('2')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('CryptoIdGenerator (RN-SEG-03)', () => {
  it('gera UUIDs distintos', () => {
    const ids = new CryptoIdGenerator();
    const a = ids.next();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(ids.next()).not.toBe(a);
  });
});
