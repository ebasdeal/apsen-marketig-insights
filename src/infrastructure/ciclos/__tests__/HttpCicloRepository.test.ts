import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { CICLO_DTOS_FIXTURE, CICLO_RASCUNHO, CICLOS_FIXTURE } from '@test/fixtures/ciclos';
import { toCicloDto } from '../cicloMapper';
import { HttpCicloRepository } from '../HttpCicloRepository';

const BASE = 'http://localhost:3001';

describe('HttpCicloRepository — leitura', () => {
  it('pede a página ordenada por início decrescente', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: CICLO_DTOS_FIXTURE, total: 3 }),
    });
    const page = await new HttpCicloRepository(http).listPage({ page: 1, size: 10 });
    expect(http.getPage).toHaveBeenCalledWith('/ciclos', {
      query: { _page: '1', _limit: '10', _sort: 'inicio', _order: 'desc' },
    });
    expect(page).toEqual({ items: CICLOS_FIXTURE, total: 3 });
  });

  it('findAtivo filtra por status=ativo e usa o total', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/ciclos?status=ativo': {
        body: [CICLO_DTOS_FIXTURE[0]],
        headers: { 'X-Total-Count': '1' },
      },
    });
    const repository = new HttpCicloRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    await expect(repository.findAtivo()).resolves.toEqual({
      ativo: CICLOS_FIXTURE[0],
      totalAtivos: 1,
    });
    expect(calls[0]?.url).toBe(`${BASE}/ciclos?status=ativo&_page=1&_limit=1`);
  });

  it('findAtivo sem ativo devolve null', async () => {
    const http = createFakeHttpClient({ getPage: async () => ({ data: [], total: 0 }) });
    await expect(new HttpCicloRepository(http).findAtivo()).resolves.toEqual({
      ativo: null,
      totalAtivos: 0,
    });
  });

  it('listCodigos lê a coleção e prefere codigo ao id legado', async () => {
    const http = createFakeHttpClient({
      get: async () => [...CICLO_DTOS_FIXTURE, toCicloDto(CICLO_RASCUNHO)],
    });
    await expect(new HttpCicloRepository(http).listCodigos()).resolves.toEqual([
      'PLP-2026-07',
      'PLP-2026-06',
      'PLP-2026-05',
      'PLP-2026-08',
    ]);
    expect(http.get).toHaveBeenCalledWith('/ciclos');
  });

  it('item sem status ou com id legado fora do padrão é InvalidResponseError', async () => {
    const semStatus = { ...CICLO_DTOS_FIXTURE[0], status: undefined };
    const legado = { ...CICLO_DTOS_FIXTURE[0], id: 'abc' };
    for (const item of [semStatus, legado]) {
      const http = createFakeHttpClient({ getPage: async () => ({ data: [item], total: 1 }) });
      await expect(
        new HttpCicloRepository(http).listPage({ page: 1, size: 10 }),
      ).rejects.toBeInstanceOf(InvalidResponseError);
    }
  });
});

describe('HttpCicloRepository — escrita', () => {
  it('POST com o corpo completo', async () => {
    const http = createFakeHttpClient({ post: async (_path, body) => body });
    await expect(new HttpCicloRepository(http).create(CICLO_RASCUNHO)).resolves.toEqual(
      CICLO_RASCUNHO,
    );
    expect(http.post).toHaveBeenCalledWith('/ciclos', toCicloDto(CICLO_RASCUNHO));
  });

  it('PATCH com o id codificado e o corpo', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/ciclos/PLP-2026-07': { body: { ...CICLO_DTOS_FIXTURE[0], status: 'encerrado' } },
    });
    const repository = new HttpCicloRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    const updated = await repository.update('PLP-2026-07', { status: 'encerrado' });
    expect(updated.status).toBe('encerrado');
    expect(calls[0]?.init?.method).toBe('PATCH');
    expect(calls[0]?.init?.body).toBe(JSON.stringify({ status: 'encerrado' }));
    const http = createFakeHttpClient({ patch: async () => CICLO_DTOS_FIXTURE[0] });
    await new HttpCicloRepository(http).update('a/b', {});
    expect(http.patch).toHaveBeenCalledWith('/ciclos/a%2Fb', {});
  });

  it('404 no PATCH vira NotFoundError; outros erros propagam', async () => {
    const notFound = createFakeHttpClient({
      patch: () => Promise.reject(new HttpError(404, `${BASE}/ciclos/x`, {})),
    });
    await expect(new HttpCicloRepository(notFound).update('x', {})).rejects.toEqual(
      new NotFoundError('Ciclo', 'x'),
    );
    const serverError = new HttpError(500, `${BASE}/ciclos/x`, {});
    const failing = createFakeHttpClient({ patch: () => Promise.reject(serverError) });
    await expect(new HttpCicloRepository(failing).update('x', {})).rejects.toBe(serverError);
  });

  it('resposta inválida do POST é InvalidResponseError', async () => {
    const http = createFakeHttpClient({ post: async () => ({ id: 'x' }) });
    await expect(new HttpCicloRepository(http).create(CICLO_RASCUNHO)).rejects.toThrow(
      'Resposta de /ciclos inválida',
    );
  });
});
