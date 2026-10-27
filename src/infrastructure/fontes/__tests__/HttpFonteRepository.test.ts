import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { FONTE_CUSTOM, FONTE_DTOS_FIXTURE, FONTES_FIXTURE } from '@test/fixtures/fontes';
import { toFonteDto } from '../fonteMapper';
import { HttpFonteRepository, escapeRegex } from '../HttpFonteRepository';

const BASE = 'http://localhost:3001';

describe('HttpFonteRepository — leitura', () => {
  it('getPage com _page/_limit e mapper com padrões', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: FONTE_DTOS_FIXTURE, total: 4 }),
    });
    const page = await new HttpFonteRepository(http).listPage({ page: 2, size: 10 });
    expect(http.getPage).toHaveBeenCalledWith('/fontes', { query: { _page: '2', _limit: '10' } });
    expect(page).toEqual({ items: FONTES_FIXTURE, total: 4 });
    expect(page.items[0]).toMatchObject({ mapValor: 'nome', mapLabel: 'razao_social' });
  });

  it('custom vem de _custom e campos ausente vira —', async () => {
    const dto = { ...toFonteDto(FONTE_CUSTOM), campos: undefined, mapValor: 'data[].x' };
    const http = createFakeHttpClient({ get: async () => [dto] });
    const [fonte] = await new HttpFonteRepository(http).listAll();
    expect(fonte).toMatchObject({ custom: true, campos: '—', mapValor: 'data[].x' });
    expect(http.get).toHaveBeenCalledWith('/fontes', { query: { _page: '1', _limit: '50' } });
  });

  it('modo inválido é InvalidResponseError', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: [{ ...FONTE_DTOS_FIXTURE[0], modo: 'x' }], total: 1 }),
    });
    await expect(
      new HttpFonteRepository(http).listPage({ page: 1, size: 10 }),
    ).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('existsNome consulta nome_like escapado e confirma pelo slug', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/fontes': { body: [FONTE_DTOS_FIXTURE[0], FONTE_DTOS_FIXTURE[3]] },
    });
    const repository = new HttpFonteRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    await expect(repository.existsNome(' concorrentes / MARCAS ')).resolves.toBe(true);
    await expect(repository.existsNome('Preços')).resolves.toBe(false);
    expect(new URL(calls[0]?.url as string).searchParams.get('nome_like')).toBe(
      'concorrentes / MARCAS',
    );
    expect(escapeRegex('Preços (IQVIA) a.b*')).toBe('Preços \\(IQVIA\\) a\\.b\\*');
  });
});

describe('HttpFonteRepository — escrita', () => {
  it('POST grava _custom, sem token', async () => {
    const http = createFakeHttpClient({ post: async (_path, body) => body });
    await expect(new HttpFonteRepository(http).create(FONTE_CUSTOM)).resolves.toEqual(FONTE_CUSTOM);
    expect(http.post).toHaveBeenCalledWith('/fontes', {
      id: FONTE_CUSTOM.id,
      nome: 'Distribuidores',
      icon: '🚚',
      desc: 'Fonte de dados personalizada.',
      modo: 'api',
      url: 'https://api.apsen.com.br/v1/distribuidores',
      auth: 'bearer',
      cache: 60,
      mapValor: 'nome',
      mapLabel: 'razao_social',
      campos: '—',
      _custom: true,
    });
  });

  it('PATCH e DELETE usam o id codificado', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/fontes/precos': { body: { ...FONTE_DTOS_FIXTURE[3], modo: 'api' } },
    });
    const repository = new HttpFonteRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
    const config = {
      modo: 'api' as const,
      url: '',
      auth: 'none' as const,
      cache: 60,
      mapValor: 'nome',
      mapLabel: 'razao_social',
    };
    await expect(repository.update('precos', config)).resolves.toMatchObject({ modo: 'api' });
    await expect(repository.delete('precos')).resolves.toBeUndefined();
    expect(calls.map((call) => [call.init?.method, call.url])).toEqual([
      ['PATCH', `${BASE}/fontes/precos`],
      ['DELETE', `${BASE}/fontes/precos`],
    ]);
    expect(calls[0]?.init?.body).toBe(JSON.stringify(config));
    const http = createFakeHttpClient({ delete: async () => ({}) });
    await new HttpFonteRepository(http).delete('a b');
    expect(http.delete).toHaveBeenCalledWith('/fontes/a%20b');
  });

  it('404 vira NotFoundError; outros erros propagam', async () => {
    const notFound = () => Promise.reject(new HttpError(404, `${BASE}/fontes/x`, {}));
    const http = createFakeHttpClient({ patch: notFound, delete: notFound });
    const repository = new HttpFonteRepository(http);
    await expect(repository.delete('x')).rejects.toEqual(new NotFoundError('Fonte', 'x'));
    await expect(
      repository.update('x', {
        modo: 'mock',
        url: '',
        auth: 'none',
        cache: 60,
        mapValor: 'nome',
        mapLabel: 'razao_social',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    const boom = new Error('rede');
    const failing = createFakeHttpClient({ delete: () => Promise.reject(boom) });
    await expect(new HttpFonteRepository(failing).delete('x')).rejects.toBe(boom);
  });
});
