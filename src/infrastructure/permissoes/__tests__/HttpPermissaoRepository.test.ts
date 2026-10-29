import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { PERMISSOES_FIXTURE } from '@test/fixtures/usuarios';
import db from '../../../../mock-api/db.json';
import { HttpPermissaoRepository } from '../HttpPermissaoRepository';

describe('HttpPermissaoRepository (§4)', () => {
  it('consulta uma página limitada a 50 e normaliza o id', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/permissoes': { body: db.permissoes, headers: { 'X-Total-Count': '11' } },
    });
    const repository = new HttpPermissaoRepository(
      new FetchHttpClient({ baseUrl: 'http://localhost:3001', fetchFn }),
    );
    const permissoes = await repository.list();
    expect(calls[0]?.url).toBe('http://localhost:3001/permissoes?_page=1&_limit=50');
    expect(permissoes).toEqual(PERMISSOES_FIXTURE);
  });

  it('campo ausente → InvalidResponseError', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: [{ id: 1, grupo: 'x' }], total: 1 }),
    });
    await expect(new HttpPermissaoRepository(http).list()).rejects.toBeInstanceOf(
      InvalidResponseError,
    );
  });
});
