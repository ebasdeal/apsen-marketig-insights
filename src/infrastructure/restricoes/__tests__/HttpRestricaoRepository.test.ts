import type { Restricao } from '@domain/restricoes/Restricao';
import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { HttpRestricaoRepository } from '../HttpRestricaoRepository';
import { toRestricaoDto } from '../restricaoMapper';

const BASE = 'http://localhost:3001';

const DTO_SEM_CODIGO = {
  id: 'RST-001',
  tipo: 'mp',
  label: '🧪 Matéria-Prima',
  desc: 'Falta de IFA — Baricitinibe',
  det: 'Fornecedor com atraso',
  produto: 'Baricitinibe 2mg e 4mg · Linha 2',
  impacto: 'Bloqueio total',
  impCor: 'critica',
  prazo: '05/07/2026',
  resp: 'Ana Planejadora',
  sev: 'critica',
  status: 'ativa',
  obs: 'Compra emergencial.',
};

const RESOLVIDA = {
  ...DTO_SEM_CODIGO,
  id: 'RST-010',
  codigo: 'RST-010',
  status: 'resolvida',
  resolucao: 'Reparo concluído.',
};

function repositoryWith(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  const repository = new HttpRestricaoRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
  return { repository, calls };
}

describe('HttpRestricaoRepository', () => {
  it('lista a página com status, _page e _limit e lê o X-Total-Count', async () => {
    const { repository, calls } = repositoryWith({
      '/restricoes': { body: [DTO_SEM_CODIGO], headers: { 'X-Total-Count': '8' } },
    });
    const page = await repository.listPage({ status: 'ativa' }, 1, 10);
    expect(calls[0]?.url).toBe(`${BASE}/restricoes?status=ativa&_page=1&_limit=10`);
    expect(page).toMatchObject({ total: 8, page: 1, limit: 10 });
    expect(page.items[0]).toMatchObject({ id: 'RST-001', codigo: 'RST-001', resolucao: null });
  });

  it('mantém a resolução e o código quando presentes e aplica os padrões do schema', async () => {
    const { repository } = repositoryWith({
      '/restricoes': {
        body: [{ ...RESOLVIDA, det: undefined, obs: undefined, prazo: undefined }],
        headers: { 'X-Total-Count': '14' },
      },
    });
    const [item] = (await repository.listPage({ status: 'resolvida' }, 2, 10)).items;
    expect(item).toMatchObject({
      codigo: 'RST-010',
      resolucao: 'Reparo concluído.',
      det: '',
      prazo: '—',
    });
  });

  it('conta com os filtros e _limit=1', async () => {
    const { repository, calls } = repositoryWith({
      '/restricoes': { body: [DTO_SEM_CODIGO], headers: { 'X-Total-Count': '3' } },
    });
    await expect(repository.count({ status: 'ativa', sev: 'critica' })).resolves.toBe(3);
    await repository.count({ status: 'ativa', tipo: 'mp' });
    expect(calls.map((call) => call.url)).toEqual([
      `${BASE}/restricoes?status=ativa&sev=critica&_limit=1`,
      `${BASE}/restricoes?status=ativa&tipo=mp&_limit=1`,
    ]);
  });

  it('payload fora do schema ou sem X-Total-Count gera InvalidResponseError', async () => {
    const invalido = repositoryWith({
      '/restricoes': { body: [{ id: 'x' }], headers: { 'X-Total-Count': '1' } },
    });
    await expect(invalido.repository.listPage({}, 1, 10)).rejects.toThrow(
      new InvalidResponseError('Resposta inválida de /restricoes'),
    );
    const semTotal = repositoryWith({ '/restricoes': { body: [] } });
    await expect(semTotal.repository.count({})).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('maiorCodigo ordena por código desc e devolve null sem registros', async () => {
    const { repository, calls } = repositoryWith({
      '/restricoes': { body: [{ ...DTO_SEM_CODIGO, codigo: 'RST-022' }] },
    });
    await expect(repository.maiorCodigo()).resolves.toBe('RST-022');
    expect(calls[0]?.url).toBe(`${BASE}/restricoes?_sort=codigo&_order=desc&_limit=1`);
    const vazio = repositoryWith({ '/restricoes': { body: [] } });
    await expect(vazio.repository.maiorCodigo()).resolves.toBeNull();
  });

  it('create faz POST do DTO sem resolução nula', async () => {
    const http = createFakeHttpClient({ post: async (_path, body) => body });
    const repository = new HttpRestricaoRepository(http);
    const nova: Restricao = {
      ...DTO_SEM_CODIGO,
      id: 'uuid-1',
      codigo: 'RST-023',
      tipo: 'mp',
      impCor: 'critica',
      sev: 'critica',
      status: 'ativa',
      resolucao: null,
    };
    await expect(repository.create(nova)).resolves.toEqual(nova);
    const body = http.post.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(http.post).toHaveBeenCalledWith('restricoes', expect.any(Object));
    expect(body).not.toHaveProperty('resolucao');
    expect(toRestricaoDto({ ...nova, resolucao: 'ok' })).toMatchObject({ resolucao: 'ok' });
  });

  it('update faz PATCH com o id codificado e converte 404 em NotFoundError', async () => {
    const { repository, calls } = repositoryWith({
      '/restricoes/uuid%201': { body: RESOLVIDA },
      '/restricoes/inexistente': { status: 404, body: {} },
    });
    await expect(
      repository.update('uuid 1', { status: 'resolvida', resolucao: 'Reparo concluído.' }),
    ).resolves.toMatchObject({ status: 'resolvida' });
    expect(calls[0]?.init?.method).toBe('PATCH');
    expect(calls[0]?.init?.body).toBe(
      JSON.stringify({ status: 'resolvida', resolucao: 'Reparo concluído.' }),
    );
    await expect(repository.update('inexistente', {})).rejects.toEqual(
      new NotFoundError('Restrição', 'inexistente'),
    );
  });

  it('update repassa outros erros HTTP e valida a resposta', async () => {
    const erro = repositoryWith({ '/restricoes/RST-001': { status: 500, body: {} } });
    await expect(erro.repository.update('RST-001', {})).rejects.toBeInstanceOf(HttpError);
    const invalida = repositoryWith({ '/restricoes/RST-001': { body: { id: 'RST-001' } } });
    await expect(invalida.repository.update('RST-001', {})).rejects.toBeInstanceOf(
      InvalidResponseError,
    );
  });
});
