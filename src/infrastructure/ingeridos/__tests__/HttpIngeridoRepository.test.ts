import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { INGERIDOS, INGERIDOS_API } from '@test/fixtures/ingeridos';
import { HttpIngeridoRepository } from '../HttpIngeridoRepository';

const BASE = 'http://localhost:3001';

describe('HttpIngeridoRepository', () => {
  it('listPage envia _page, _limit, q e categoria (vazios omitidos)', async () => {
    const http = createFakeHttpClient({ getPage: async () => ({ data: INGERIDOS_API, total: 4 }) });
    const repository = new HttpIngeridoRepository(http);
    const result = await repository.listPage(
      { q: ' bari ', categoria: 'Supply' },
      { page: 1, size: 10 },
    );
    expect(http.getPage).toHaveBeenCalledWith('/ingeridos', {
      query: { _page: '1', _limit: '10', q: 'bari', categoria: 'Supply' },
    });
    expect(result).toEqual({ items: INGERIDOS, total: 4, page: 1, limit: 10 });
    await repository.listPage({ q: '', categoria: '' }, { page: 2, size: 10 });
    expect(http.getPage).toHaveBeenLastCalledWith('/ingeridos', {
      query: { _page: '2', _limit: '10' },
    });
  });

  it('mapper converte cores e badge', () => {
    expect(INGERIDOS[0]).toMatchObject({
      id: 'DRV-2026-029',
      badge: 'supply',
      featureTone: 'red',
      idTone: 'blue',
    });
  });

  it('badge fora do padrão → InvalidResponseError', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: [{ ...INGERIDOS_API[0], badge: 'x' }], total: 1 }),
    });
    await expect(
      new HttpIngeridoRepository(http).listPage({ q: '', categoria: '' }, { page: 1, size: 10 }),
    ).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('delete: 200 ok, 404 → NotFoundError, 500 propaga', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/ingeridos/DRV-2026-029': { body: {} },
      '/ingeridos/DRV-500': { status: 500, body: {} },
    });
    const repository = new HttpIngeridoRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    await expect(repository.delete('DRV-2026-029')).resolves.toBeUndefined();
    expect(calls[0]?.init?.method).toBe('DELETE');
    await expect(repository.delete('DRV-404')).rejects.toEqual(
      new NotFoundError('Driver ingerido', 'DRV-404'),
    );
    await expect(repository.delete('DRV-500')).rejects.toBeInstanceOf(HttpError);
  });
});
