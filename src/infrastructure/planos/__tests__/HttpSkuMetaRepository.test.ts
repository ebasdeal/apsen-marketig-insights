import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { HttpCicloAtivoRepository } from '../HttpCicloAtivoRepository';
import { HttpSkuMetaRepository } from '../HttpSkuMetaRepository';

const BASE = 'http://localhost:3001';

const META = {
  id: 'SKU-00312',
  nome: 'Baricitinibe 2mg',
  apres: 'Blister 28cp',
  familia: 'Imunologia',
};

function httpWith(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  return { http: new FetchHttpClient({ baseUrl: BASE, fetchFn }), calls };
}

describe('HttpSkuMetaRepository', () => {
  it('busca os SKUs com id repetido na query', async () => {
    const { http, calls } = httpWith({ '/skuMeta': { body: [META] } });
    const metas = await new HttpSkuMetaRepository(http).listByIds(['SKU-00312', 'SKU-00313']);
    expect(metas).toEqual([META]);
    expect(calls[0]?.url).toBe(`${BASE}/skuMeta?id=SKU-00312&id=SKU-00313`);
  });

  it('sem ids não chama a API e payload inválido gera InvalidResponseError', async () => {
    const { http, calls } = httpWith({ '/skuMeta': { body: [{ id: 1 }] } });
    const repository = new HttpSkuMetaRepository(http);
    await expect(repository.listByIds([])).resolves.toEqual([]);
    expect(calls).toHaveLength(0);
    await expect(repository.listByIds(['SKU-1'])).rejects.toBeInstanceOf(InvalidResponseError);
  });
});

describe('HttpCicloAtivoRepository', () => {
  it('devolve o id do ciclo ativo ou null', async () => {
    const { http, calls } = httpWith({
      '/ciclos': { body: [{ id: 'PLP-2026-07', status: 'ativo', descricao: 'Julho' }] },
    });
    await expect(new HttpCicloAtivoRepository(http).cicloAtivoId()).resolves.toBe('PLP-2026-07');
    expect(calls[0]?.url).toBe(`${BASE}/ciclos?status=ativo`);
    const vazio = httpWith({ '/ciclos': { body: [{ id: 'PLP-2026-06', status: 'encerrado' }] } });
    await expect(new HttpCicloAtivoRepository(vazio.http).cicloAtivoId()).resolves.toBeNull();
  });
});
