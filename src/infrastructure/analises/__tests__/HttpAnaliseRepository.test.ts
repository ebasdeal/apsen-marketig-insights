import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { ANALISE_001_API, ANALISE_002_API, buildAnalise } from '@test/fixtures/analises';
import { HttpAnaliseRepository } from '../HttpAnaliseRepository';

const BASE = 'http://localhost:3001';

function setup(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  const http = new FetchHttpClient({ baseUrl: BASE, fetchFn, getToken: () => 'tok' });
  return { repository: new HttpAnaliseRepository(http), calls };
}

function bodyOf(init: RequestInit | undefined): unknown {
  return JSON.parse(String(init?.body));
}

describe('HttpAnaliseRepository', () => {
  it('lista com q, status, _page e _limit e lê o X-Total-Count', async () => {
    const { repository, calls } = setup({
      '/analises': { body: [ANALISE_001_API], headers: { 'X-Total-Count': '11' } },
    });
    const page = await repository.listPage({
      busca: 'bari',
      status: 'salva',
      pagina: 1,
      tamanho: 10,
    });
    expect(calls[0]?.url).toBe(
      `${BASE}/analises?_page=1&_limit=10&_sort=codigo&_order=desc&q=bari&status=salva`,
    );
    expect(new Headers(calls[0]?.init?.headers).get('Authorization')).toBe('Bearer tok');
    expect(page).toMatchObject({ total: 11, page: 1, limit: 10 });
    expect(page.items[0]).toMatchObject({
      id: 'ANL-001',
      codigo: 'ANL-001',
      driversImpacto: ANALISE_001_API.drivers_impacto,
      modeloInfo: ANALISE_001_API.modelo_info,
      salvoEm: '20/06/2026 15:42',
      comentarios: '',
      drivers: [],
      configModelo: null,
    });
  });

  it('omite busca e status vazios', async () => {
    const { repository, calls } = setup({
      '/analises': { body: [], headers: { 'X-Total-Count': '0' } },
    });
    await repository.listPage({ busca: '  ', status: '', pagina: 2, tamanho: 10 });
    expect(calls[0]?.url).toBe(`${BASE}/analises?_page=2&_limit=10&_sort=codigo&_order=desc`);
  });

  it('sem X-Total-Count ou com item fora do contrato → InvalidResponseError', async () => {
    const semTotal = setup({ '/analises': { body: [] } });
    await expect(
      semTotal.repository.listPage({ busca: '', status: '', pagina: 1, tamanho: 10 }),
    ).rejects.toBeInstanceOf(InvalidResponseError);
    const invalido = setup({
      '/analises': { body: [{ id: 'x' }], headers: { 'X-Total-Count': '1' } },
    });
    await expect(
      invalido.repository.listPage({ busca: '', status: '', pagina: 1, tamanho: 10 }),
    ).rejects.toThrow(/titulo/);
  });

  it('count usa _limit=1 com status opcional', async () => {
    const { repository, calls } = setup({
      '/analises': { body: [], headers: { 'X-Total-Count': '2' } },
    });
    await expect(repository.count()).resolves.toBe(2);
    await expect(repository.count({ status: 'relatorio' })).resolves.toBe(2);
    expect(calls.map((call) => call.url)).toEqual([
      `${BASE}/analises?_page=1&_limit=1`,
      `${BASE}/analises?status=relatorio&_page=1&_limit=1`,
    ]);
  });

  it('get mapeia o detalhe; codigo ausente usa o id; salvo_em e ts ausentes viram null', async () => {
    const semCodigo: Record<string, unknown> = { ...ANALISE_002_API };
    delete semCodigo.codigo;
    delete semCodigo.salvo_em;
    const { repository, calls } = setup({
      '/analises/uuid%2F1': {
        body: {
          ...semCodigo,
          id: 'uuid/1',
          comentarios: 'contexto',
          drivers: ['DRV-1'],
          config_modelo: {
            modo: 'avancado',
            modelo: 'sarimax',
            horizonte: 3,
            parametros: { p: 1 },
          },
        },
      },
    });
    const analise = await repository.get('uuid/1');
    expect(calls[0]?.url).toBe(`${BASE}/analises/uuid%2F1`);
    expect(analise).toMatchObject({
      id: 'uuid/1',
      codigo: 'uuid/1',
      salvoEm: null,
      comentarios: 'contexto',
      drivers: ['DRV-1'],
      configModelo: { modo: 'avancado', modelo: 'sarimax', horizonte: 3, parametros: { p: 1 } },
      historicoIa: [
        {
          pergunta: 'Por que Anlodipino não foi afetado?',
          resposta: 'Anlodipino já tem concorrência genérica madura.',
          ts: null,
        },
      ],
    });
  });

  it('config_modelo só com o modo e campos de resultado ausentes usam os padrões', async () => {
    const { repository } = setup({
      '/analises/ANL-009': {
        body: {
          id: 'ANL-009',
          titulo: 't',
          ciclo: 'c',
          tipo: 'x',
          skus: [],
          modelo: 'm',
          status: 'rascunho',
          criada: '01/01/2026',
          config_modelo: { modo: 'auto' },
        },
      },
    });
    await expect(repository.get('ANL-009')).resolves.toMatchObject({
      configModelo: { modo: 'auto' },
      sumario: '',
      driversImpacto: [],
      justificativas: [],
      modeloInfo: '',
      historicoIa: [],
      salvoEm: null,
    });
  });

  it('404 no detalhe e na atualização → NotFoundError; 500 propaga', async () => {
    const { repository } = setup({ '/analises/ANL-500': { status: 500, body: {} } });
    await expect(repository.get('ANL-404')).rejects.toEqual(
      new NotFoundError('Análise', 'ANL-404'),
    );
    await expect(repository.update('ANL-404', { status: 'salva' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(repository.get('ANL-500')).rejects.toBeInstanceOf(HttpError);
  });

  it('maiorCodigo ordena por codigo desc com _limit=1', async () => {
    const { repository, calls } = setup({ '/analises': { body: [{ codigo: 'ANL-002' }] } });
    await expect(repository.maiorCodigo()).resolves.toBe('ANL-002');
    expect(calls[0]?.url).toBe(`${BASE}/analises?_sort=codigo&_order=desc&_limit=1`);
    const vazio = setup({ '/analises': { body: [] } });
    await expect(vazio.repository.maiorCodigo()).resolves.toBeNull();
    const semCodigo = setup({ '/analises': { body: [{ id: 'x' }] } });
    await expect(semCodigo.repository.maiorCodigo()).resolves.toBeNull();
  });

  it('create faz POST com os nomes do db.json', async () => {
    const nova = buildAnalise({
      id: 'uuid-1',
      codigo: 'ANL-003',
      status: 'rascunho',
      salvoEm: null,
      drivers: ['DRV-2026-032'],
      configModelo: { modo: 'guiado', modelo: 'prophet' },
      historicoIa: [{ pergunta: 'p', resposta: 'r', ts: null }],
    });
    const http = createFakeHttpClient({
      post: async (_path, body) => ({ ...(body as object) }),
    });
    const criada = await new HttpAnaliseRepository(http).create(nova);
    expect(http.post).toHaveBeenCalledWith(
      '/analises',
      expect.objectContaining({
        id: 'uuid-1',
        codigo: 'ANL-003',
        status: 'rascunho',
        drivers: ['DRV-2026-032'],
        config_modelo: { modo: 'guiado', modelo: 'prophet' },
        drivers_impacto: nova.driversImpacto,
        modelo_info: nova.modeloInfo,
        historico_ia: [{ pergunta: 'p', resposta: 'r' }],
        salvo_em: null,
      }),
    );
    expect(criada).toEqual(nova);
  });

  it('create sem configModelo omite config_modelo', async () => {
    const http = createFakeHttpClient({ post: async (_path, body) => body });
    await new HttpAnaliseRepository(http).create(buildAnalise());
    expect(http.post.mock.calls[0]?.[1]).not.toHaveProperty('config_modelo');
  });

  it('update faz PATCH só com os campos informados', async () => {
    const { repository, calls } = setup({
      '/analises/ANL-001': { body: { ...ANALISE_001_API, status: 'relatorio' } },
    });
    await repository.update('ANL-001', { status: 'salva', salvoEm: '27/10/2026 14:05' });
    await repository.update('ANL-001', { status: 'relatorio' });
    const atualizada = await repository.update('ANL-001', {
      historicoIa: [{ pergunta: 'p', resposta: 'r', ts: '27/10/2026 14:05' }],
    });
    expect(calls.map((call) => call.init?.method)).toEqual(['PATCH', 'PATCH', 'PATCH']);
    expect(calls.map((call) => bodyOf(call.init))).toEqual([
      { status: 'salva', salvo_em: '27/10/2026 14:05' },
      { status: 'relatorio' },
      { historico_ia: [{ pergunta: 'p', resposta: 'r', ts: '27/10/2026 14:05' }] },
    ]);
    expect(atualizada.status).toBe('relatorio');
  });
});
