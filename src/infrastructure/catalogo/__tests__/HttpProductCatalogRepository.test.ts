import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { makeFamilia, makeFranquia, makeSku } from '@test/factories/catalogo';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { HttpProductCatalogRepository } from '../HttpProductCatalogRepository';

const BASE = 'http://localhost:3001';
const SKU = makeSku();
const FAMILIA = makeFamilia();

function repositoryFor(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  return {
    repository: new HttpProductCatalogRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn })),
    calls,
  };
}

describe('HttpProductCatalogRepository — buscas do formulário (§4.3)', () => {
  it('SKUs com q, ordenação e limite; termo vazio sem q', async () => {
    const { repository, calls } = repositoryFor({ '/skus': { body: [SKU] } });
    await expect(repository.searchSkus(' lev ', 20)).resolves.toEqual([SKU]);
    expect(calls[0]?.url).toBe(`${BASE}/skus?q=lev&_sort=familia%2Cid&_order=asc%2Casc&_limit=20`);
    await repository.searchSkus('', 20);
    expect(calls[1]?.url).toBe(`${BASE}/skus?_sort=familia%2Cid&_order=asc%2Casc&_limit=20`);
  });

  it('famílias com id_like escapado', async () => {
    const { repository, calls } = repositoryFor({ '/familias': { body: [FAMILIA] } });
    await repository.searchFamilias('MOTILEX HA + MSM', 20);
    expect(calls[0]?.url).toBe(
      `${BASE}/familias?id_like=MOTILEX%20HA%20%5C%2B%20MSM&_sort=franquia%2Cid&_order=asc%2Casc&_limit=20`,
    );
    await repository.searchFamilias(' ', 20);
    expect(calls[1]?.url).not.toContain('id_like');
  });

  it('findSku tenta o id e depois q=codigo', async () => {
    const http = createFakeHttpClient({
      get: async (path) => {
        if (path === `/skus/${encodeURIComponent(SKU.id)}`) {
          return SKU;
        }
        if (path === '/skus') {
          return [SKU];
        }
        throw new HttpError(404, path, null);
      },
    });
    const repository = new HttpProductCatalogRepository(http);
    await expect(repository.findSku(SKU.id, '2300')).resolves.toEqual(SKU);
    expect(http.get).toHaveBeenCalledTimes(1);
    await expect(repository.findSku('Baricitinibe 2mg (SKU-00312)', 'SKU-00312')).resolves.toEqual(
      SKU,
    );
    expect(http.get).toHaveBeenLastCalledWith('/skus', { query: { q: 'SKU-00312', _limit: '1' } });
  });

  it('findSku sem resultado devolve null', async () => {
    const { repository } = repositoryFor({ '/skus': { body: [] } });
    await expect(repository.findSku('X', 'Y')).resolves.toBeNull();
    await expect(repository.findSku('X', '')).resolves.toBeNull();
    await expect(repository.findSku('', '')).resolves.toBeNull();
  });

  it('getFamilia codifica o id; 404 → NotFoundError(Família)', async () => {
    const { repository, calls } = repositoryFor({ '/familias/LEVOXIN': { body: FAMILIA } });
    await expect(repository.getFamilia('LEVOXIN')).resolves.toEqual(FAMILIA);
    const erro = await repository.getFamilia('MOTILEX HA + MSM').catch((error: unknown) => error);
    expect(erro).toBeInstanceOf(NotFoundError);
    expect(erro).toMatchObject({ resource: 'Família', resourceId: 'MOTILEX HA + MSM' });
    expect(calls[1]?.url).toBe(`${BASE}/familias/MOTILEX%20HA%20%2B%20MSM`);
  });

  it('famílias da franquia e franquias', async () => {
    const { repository, calls } = repositoryFor({
      '/familias': { body: [FAMILIA] },
      '/franquias': { body: [makeFranquia()] },
    });
    await expect(repository.listFamiliasDaFranquia('ASTER')).resolves.toEqual([FAMILIA]);
    expect(calls[0]?.url).toBe(`${BASE}/familias?franquia=ASTER`);
    await expect(repository.listFranquias()).resolves.toEqual([makeFranquia()]);
  });

  it('payload inválido → InvalidResponseError', async () => {
    const { repository } = repositoryFor({ '/franquias': { body: [{ id: '' }] } });
    await expect(repository.listFranquias()).rejects.toBeInstanceOf(InvalidResponseError);
  });
});

describe('HttpProductCatalogRepository.listFamilias (catálogo §4, CA-04)', () => {
  const base = { busca: '', franquia: '', familia: '', page: 1, size: 10 };

  it('monta a URL do json-server só com os filtros preenchidos', async () => {
    const { repository, calls } = repositoryFor({
      '/familias': { body: [FAMILIA], headers: { 'X-Total-Count': '92' } },
    });
    const page = await repository.listFamilias({ ...base, busca: ' lev ', franquia: 'ASTER' });
    expect(calls[0]?.url).toBe(
      `${BASE}/familias?_page=1&_limit=10&_sort=franquia%2Cid&_order=asc%2Casc&q=lev&franquia=ASTER`,
    );
    expect(page).toEqual({ items: [FAMILIA], total: 92, page: 1, limit: 10 });
    await repository.listFamilias({ ...base, familia: 'LEVOXIN', page: 2, size: 25 });
    expect(calls[1]?.url).toBe(
      `${BASE}/familias?_page=2&_limit=25&_sort=franquia%2Cid&_order=asc%2Casc&id=LEVOXIN`,
    );
    await repository.listFamilias(base);
    expect(calls[2]?.url).not.toMatch(/[?&](q|franquia|id)=/);
  });

  it('sem X-Total-Count → InvalidResponseError', async () => {
    const { repository } = repositoryFor({ '/familias': { body: [FAMILIA] } });
    await expect(repository.listFamilias(base)).rejects.toBeInstanceOf(InvalidResponseError);
  });
});
