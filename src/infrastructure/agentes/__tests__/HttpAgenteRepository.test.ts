import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { AGENTES_FIXTURE, buildAgente } from '@test/fixtures/agentes';
import db from '../../../../mock-api/db.json';
import { HttpAgenteRepository } from '../HttpAgenteRepository';

const BASE = 'http://localhost:3001';

const NOVO_API = {
  id: 'e7d4-uuid',
  codigo: 'AG-006',
  papel: '➕ Agente customizado',
  nome: 'Agente Preços — Homologação',
  fontes: 'https://www.gov.br/anvisa',
  provedor: 'openai',
  endpoint: 'https://api.openai.com',
  secret: 'apsen-di-precos-key',
  vault: 'https://apsen-keyvault.vault.azure.net',
  modelo: 'gpt-4o',
  schedule: 'Diário · 03h00',
  ambiente: 'Homologação',
  limiar: 80,
  ultimo_teste: { status: 'pendente', ts: '— não testado' },
  ativo: false,
};

function fetchRepository() {
  const ativos = db.agentes.filter((agente) => agente.ativo);
  const { fetchFn, calls } = createFakeFetch({
    '/agentes?_page=1': { body: db.agentes, headers: { 'X-Total-Count': '5' } },
    '/agentes?ativo=true': { body: ativos, headers: { 'X-Total-Count': String(ativos.length) } },
    '/agentes': { body: db.agentes },
    '/agentes/AG-005': { body: db.agentes[4] },
  });
  return {
    repository: new HttpAgenteRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn })),
    calls,
  };
}

describe('HttpAgenteRepository (§4)', () => {
  it('lista paginada com _page/_limit; codigo legado = id; limiar padrão 75', async () => {
    const { repository, calls } = fetchRepository();
    const page = await repository.listPage({ page: 1, size: 10 });
    expect(calls[0]?.url).toBe(`${BASE}/agentes?_page=1&_limit=10`);
    expect(page).toEqual({ items: AGENTES_FIXTURE, total: 5, page: 1, limit: 10 });
  });

  it('ativos com ativo=true, página 1 e limite 50', async () => {
    const { repository, calls } = fetchRepository();
    const ativos = await repository.listAtivos();
    expect(calls[0]?.url).toBe(`${BASE}/agentes?ativo=true&_page=1&_limit=50`);
    expect(ativos.total).toBe(3);
    expect(ativos.items.every((agente) => agente.ativo)).toBe(true);
  });

  it('códigos vêm da coleção inteira', async () => {
    const { repository, calls } = fetchRepository();
    await expect(repository.listCodigos()).resolves.toEqual([
      'AG-001',
      'AG-002',
      'AG-003',
      'AG-004',
      'AG-005',
    ]);
    expect(calls[0]?.url).toBe(`${BASE}/agentes`);
  });

  it('get mapeia ultimo_teste; 404 → NotFoundError; 500 propaga', async () => {
    const { repository } = fetchRepository();
    await expect(repository.get('AG-005')).resolves.toEqual(AGENTES_FIXTURE[4]);
    await expect(repository.get('AG-999')).rejects.toEqual(new NotFoundError('Agente', 'AG-999'));
    const falha = new HttpError(500, 'x', null);
    const quebrado = new HttpAgenteRepository(
      createFakeHttpClient({ get: () => Promise.reject(falha) }),
    );
    await expect(quebrado.get('AG-001')).rejects.toBe(falha);
  });

  it('create envia o corpo do §4 com ultimo_teste', async () => {
    const http = createFakeHttpClient({ post: async (_path, body) => body });
    const novo = buildAgente({
      id: 'e7d4-uuid',
      codigo: 'AG-006',
      papel: '➕ Agente customizado',
      nome: 'Agente Preços — Homologação',
      fontes: 'https://www.gov.br/anvisa',
      provedor: 'openai',
      endpoint: 'https://api.openai.com',
      secret: 'apsen-di-precos-key',
      vault: 'https://apsen-keyvault.vault.azure.net',
      modelo: 'gpt-4o',
      ambiente: 'Homologação',
      limiar: 80,
      ultimoTeste: { status: 'pendente', ts: '— não testado' },
      ativo: false,
    });
    await expect(new HttpAgenteRepository(http).create(novo)).resolves.toEqual(novo);
    expect(http.post).toHaveBeenCalledWith('/agentes', NOVO_API);
  });

  it('update converte ultimoTeste em ultimo_teste; 404 → NotFoundError', async () => {
    const http = createFakeHttpClient({
      patch: async (_path, body) => ({ ...db.agentes[0], ...(body as object) }),
    });
    const repository = new HttpAgenteRepository(http);
    const ultimoTeste = { status: 'ok' as const, ts: '27/10/2026 14:05' };
    await expect(repository.update('AG-001', { ultimoTeste })).resolves.toMatchObject({
      ultimoTeste,
    });
    expect(http.patch).toHaveBeenCalledWith('/agentes/AG-001', { ultimo_teste: ultimoTeste });
    await repository.update('AG-001', { ativo: false });
    expect(http.patch).toHaveBeenLastCalledWith('/agentes/AG-001', { ativo: false });
    const ausente = new HttpAgenteRepository(
      createFakeHttpClient({ patch: () => Promise.reject(new HttpError(404, 'x', null)) }),
    );
    await expect(ausente.update('AG-9', { ativo: true })).rejects.toBeInstanceOf(NotFoundError);
    const falha = new HttpError(503, 'x', null);
    const quebrado = new HttpAgenteRepository(
      createFakeHttpClient({ patch: () => Promise.reject(falha) }),
    );
    await expect(quebrado.update('AG-9', { ativo: true })).rejects.toBe(falha);
  });

  it('provedor "x" → InvalidResponseError', async () => {
    const http = createFakeHttpClient({
      getPage: async () => ({ data: [{ ...db.agentes[0], provedor: 'x' }], total: 1 }),
    });
    await expect(new HttpAgenteRepository(http).listPage({ page: 1, size: 10 })).rejects.toThrow(
      new InvalidResponseError('Resposta de /agentes fora do contrato: 0.provedor'),
    );
  });
});
