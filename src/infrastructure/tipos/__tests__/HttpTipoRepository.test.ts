import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { CAMPOS_TIPO_API, CATEGORIAS_API, TIPOS, TIPOS_API } from '@test/fixtures/tipos';
import { HttpTipoRepository } from '../HttpTipoRepository';

const BASE = 'http://localhost:3001';

function viaFetch(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  return {
    repository: new HttpTipoRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn })),
    calls,
  };
}

const page = (data: unknown, total: number) => async () => ({ data, total });

describe('HttpTipoRepository — leitura', () => {
  it('listPage usa getPage com _page, _limit e cat', async () => {
    const http = createFakeHttpClient({ getPage: page(TIPOS_API.slice(0, 6), 6) });
    const result = await new HttpTipoRepository(http).listPage({ page: 1, size: 10, cat: 'midia' });
    expect(http.getPage).toHaveBeenCalledWith('/tipos', {
      query: { _page: '1', _limit: '10', cat: 'midia' },
    });
    expect(result).toEqual({ items: TIPOS.slice(0, 6), total: 6, page: 1, limit: 10 });
    await new HttpTipoRepository(http).listPage({ page: 2, size: 25 });
    expect(http.getPage).toHaveBeenLastCalledWith('/tipos', {
      query: { _page: '2', _limit: '25' },
    });
  });

  it('count lê o X-Total-Count com e sem ativo', async () => {
    const { repository, calls } = viaFetch({
      '/tipos?ativo=true': { body: [], headers: { 'X-Total-Count': '45' } },
      '/tipos': { body: [], headers: { 'X-Total-Count': '47' } },
    });
    await expect(repository.count()).resolves.toBe(47);
    await expect(repository.count({ ativo: true })).resolves.toBe(45);
    expect(calls.map((call) => call.url)).toEqual([
      `${BASE}/tipos?_page=1&_limit=1`,
      `${BASE}/tipos?_page=1&_limit=1&ativo=true`,
    ]);
  });

  it('get mapeia padrões e 404 vira NotFoundError', async () => {
    const { repository } = viaFetch({ '/tipos/tv': { body: TIPOS_API[0] } });
    await expect(repository.get('tv')).resolves.toMatchObject({
      id: 'tv',
      desc: '',
      impacto: 'aumento',
      perm: 'temporario',
      nota: '',
    });
    await expect(repository.get('nada')).rejects.toEqual(new NotFoundError('Tipo', 'nada'));
  });

  it('get propaga 500', async () => {
    const { repository } = viaFetch({ '/tipos/tv': { status: 500, body: {} } });
    await expect(repository.get('tv')).rejects.toBeInstanceOf(HttpError);
  });

  it('findBySlug consulta ?slug= e devolve null sem resultado', async () => {
    const http = createFakeHttpClient({
      get: async (_path, options) => (options?.query?.slug === 'tv' ? [TIPOS_API[0]] : []),
    });
    const repository = new HttpTipoRepository(http);
    await expect(repository.findBySlug('tv')).resolves.toMatchObject({ id: 'tv' });
    await expect(repository.findBySlug('novo')).resolves.toBeNull();
    expect(http.get).toHaveBeenCalledWith('/tipos', { query: { slug: 'tv' } });
  });

  it('getCampos 404 → null e preserva atributos desconhecidos', async () => {
    const tv = {
      ...CAMPOS_TIPO_API[0]!,
      campos: [{ ...CAMPOS_TIPO_API[0]!.campos[0]!, extra: 1 }],
    };
    const { repository } = viaFetch({ '/camposTipo/tv': { body: tv } });
    const campos = await repository.getCampos('tv');
    expect(campos?.layout).toBe('g3');
    expect(campos?.campos[0]).toMatchObject({ param: 'canal', extra: 1 });
    expect(campos?.campos[0]).not.toHaveProperty('options');
    await expect(repository.getCampos('nada')).resolves.toBeNull();
  });

  it('getCampos propaga 500', async () => {
    const { repository } = viaFetch({ '/camposTipo/tv': { status: 500, body: {} } });
    await expect(repository.getCampos('tv')).rejects.toBeInstanceOf(HttpError);
  });

  it('type de campo inválido → InvalidResponseError', async () => {
    const quebrado = {
      ...CAMPOS_TIPO_API[0]!,
      campos: [{ ...CAMPOS_TIPO_API[0]!.campos[0]!, type: 'radio' }],
    };
    const http = createFakeHttpClient({ get: async () => quebrado });
    await expect(new HttpTipoRepository(http).getCampos('tv')).rejects.toEqual(
      new InvalidResponseError('Resposta de /camposTipo/tv fora do contrato: campos.0.type'),
    );
  });

  it('listCategorias valida o contrato', async () => {
    const http = createFakeHttpClient({ get: async () => CATEGORIAS_API });
    const categorias = await new HttpTipoRepository(http).listCategorias();
    expect(categorias).toHaveLength(10);
    expect(categorias[0]).toMatchObject({ id: 0, slug: 'midia' });
    const invalido = createFakeHttpClient({
      get: async () => [{ ...CATEGORIAS_API[0], slug: 'x' }],
    });
    await expect(new HttpTipoRepository(invalido).listCategorias()).rejects.toBeInstanceOf(
      InvalidResponseError,
    );
  });
});

describe('HttpTipoRepository — escrita', () => {
  it('create, update, delete e categorias', async () => {
    const ok = async () => ({});
    const http = createFakeHttpClient({ post: ok, patch: ok, delete: ok, put: ok });
    const repository = new HttpTipoRepository(http);
    const tipo = TIPOS[0]!;
    await repository.create(tipo);
    await repository.update('tv', { ativo: false });
    await repository.delete('tv');
    await repository.updateCategoriaTipos(0, [{ slug: 'tv', label: 'TV' }]);
    expect(http.post).toHaveBeenCalledWith('/tipos', tipo);
    expect(http.patch).toHaveBeenCalledWith('/tipos/tv', { ativo: false });
    expect(http.delete).toHaveBeenCalledWith('/tipos/tv');
    expect(http.patch).toHaveBeenCalledWith('/categorias/0', {
      tipos: [{ slug: 'tv', label: 'TV' }],
    });
  });

  it('saveCampos faz PUT se existe, senão POST', async () => {
    const ok = async () => ({});
    const http = createFakeHttpClient({ post: ok, put: ok });
    const repository = new HttpTipoRepository(http);
    const campos = { id: 'id 1', title: 'T', layout: 'g2' as const, campos: [] };
    await repository.saveCampos(campos, true);
    await repository.saveCampos(campos, false);
    expect(http.put).toHaveBeenCalledWith('/camposTipo/id%201', campos);
    expect(http.post).toHaveBeenCalledWith('/camposTipo', campos);
  });

  it('delete 404 → NotFoundError; deleteCampos ignora 404 e propaga 500', async () => {
    const { repository } = viaFetch({ '/camposTipo/erro': { status: 500, body: {} } });
    await expect(repository.delete('nada')).rejects.toBeInstanceOf(NotFoundError);
    await expect(repository.deleteCampos('nada')).resolves.toBeUndefined();
    await expect(repository.deleteCampos('erro')).rejects.toBeInstanceOf(HttpError);
  });
});
