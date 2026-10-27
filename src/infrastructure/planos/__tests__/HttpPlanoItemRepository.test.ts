import type { PlanoItem } from '@domain/planos/PlanoItem';
import { NotFoundError } from '@domain/shared/DomainError';
import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { HttpPlanoItemRepository } from '../HttpPlanoItemRepository';

const BASE = 'http://localhost:3001';

const DTO = {
  id: 'PLP-2026-07-001',
  sku: 'SKU-00312',
  nome: 'Baricitinibe 2mg',
  apres: 'Blister 28cp',
  familia: 'Imunologia',
  qtd: 42500,
  linha: 'Linha 1',
  semana: 'S27 (30/06–06/07)',
  status: 'aprovado',
  resp: 'Ana Planejadora',
  obs: '',
};

const FILTRO_VAZIO = {
  busca: '',
  familia: '',
  status: '' as const,
  ordem: null,
  pagina: 1,
  tamanho: 10 as const,
};

function repositoryWith(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  const repository = new HttpPlanoItemRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn }));
  return { repository, calls };
}

const LISTA: FakeRoute = { body: [DTO], headers: { 'X-Total-Count': '247' } };

describe('HttpPlanoItemRepository', () => {
  it('lista com q, familia, status, _sort, _order, _page e _limit', async () => {
    const { repository, calls } = repositoryWith({ '/planoItens': LISTA });
    const page = await repository.listPage({
      busca: ' bari ',
      familia: 'Imunologia',
      status: 'aprovado',
      ordem: { campo: 'codigo', direcao: 'asc' },
      pagina: 1,
      tamanho: 10,
    });
    expect(calls[0]?.url).toBe(
      `${BASE}/planoItens?q=bari&familia=Imunologia&status=aprovado&_sort=codigo&_order=asc&_page=1&_limit=10`,
    );
    expect(page).toMatchObject({ total: 247, page: 1, limit: 10 });
    expect(page.items[0]).toMatchObject({ id: 'PLP-2026-07-001', codigo: 'PLP-2026-07-001' });
  });

  it('omite filtros vazios e sem ordem', async () => {
    const { repository, calls } = repositoryWith({ '/planoItens': LISTA });
    await repository.listPage({ ...FILTRO_VAZIO, pagina: 3, tamanho: 25 });
    expect(calls[0]?.url).toBe(`${BASE}/planoItens?_page=3&_limit=25`);
  });

  it('payload inválido ou sem X-Total-Count gera InvalidResponseError', async () => {
    const invalido = repositoryWith({
      '/planoItens': { body: [{ ...DTO, qtd: -1 }], headers: { 'X-Total-Count': '1' } },
    });
    await expect(invalido.repository.listPage(FILTRO_VAZIO)).rejects.toThrow(
      new InvalidResponseError('Resposta inválida de /planoItens'),
    );
    const semTotal = repositoryWith({ '/planoItens': { body: [] } });
    await expect(semTotal.repository.count()).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('conta total e por status com _limit=1', async () => {
    const { repository, calls } = repositoryWith({ '/planoItens': LISTA });
    await expect(repository.count()).resolves.toBe(247);
    await repository.count({ status: 'aprovado' });
    expect(calls.map((call) => call.url)).toEqual([
      `${BASE}/planoItens?_limit=1`,
      `${BASE}/planoItens?status=aprovado&_limit=1`,
    ]);
  });

  it('get busca pelo id codificado; 404 vira NotFoundError', async () => {
    const { repository, calls } = repositoryWith({
      '/planoItens/PLP-2026-07-001': { body: { ...DTO, codigo: 'PLP-2026-07-001' } },
      '/planoItens/a%2Fb': { status: 404, body: {} },
    });
    await expect(repository.get('PLP-2026-07-001')).resolves.toMatchObject({ qtd: 42500 });
    await expect(repository.get('a/b')).rejects.toEqual(new NotFoundError('Item do plano', 'a/b'));
    expect(calls[1]?.url).toBe(`${BASE}/planoItens/a%2Fb`);
  });

  it('maiorCodigo filtra pelo prefixo com codigo_like e ordena desc', async () => {
    const { repository, calls } = repositoryWith({
      '/planoItens': { body: [{ ...DTO, id: 'uuid', codigo: 'PLP-2026-07-247' }] },
    });
    await expect(repository.maiorCodigo('PLP-2026-07')).resolves.toBe('PLP-2026-07-247');
    await repository.maiorCodigo();
    expect(calls.map((call) => call.url)).toEqual([
      `${BASE}/planoItens?codigo_like=%5EPLP-2026-07-&_sort=codigo&_order=desc&_limit=1`,
      `${BASE}/planoItens?_sort=codigo&_order=desc&_limit=1`,
    ]);
    const vazio = repositoryWith({ '/planoItens': { body: [] } });
    await expect(vazio.repository.maiorCodigo('X')).resolves.toBeNull();
  });

  it('create faz POST do item completo', async () => {
    const http = createFakeHttpClient({ post: async (_path, body) => body });
    const item: PlanoItem = { ...DTO, id: 'uuid-1', codigo: 'PLP-2026-07-248', status: 'pendente' };
    await expect(new HttpPlanoItemRepository(http).create(item)).resolves.toEqual(item);
    expect(http.post).toHaveBeenCalledWith('planoItens', item);
  });

  it('update faz PATCH e delete usa o método DELETE', async () => {
    const { repository, calls } = repositoryWith({
      '/planoItens/PLP-2026-07-005': { body: { ...DTO, id: 'PLP-2026-07-005', qtd: 1 } },
    });
    await expect(repository.update('PLP-2026-07-005', { qtd: 1 })).resolves.toMatchObject({
      qtd: 1,
    });
    await expect(repository.delete('PLP-2026-07-005')).resolves.toBeUndefined();
    expect(calls.map((call) => call.init?.method)).toEqual(['PATCH', 'DELETE']);
    expect(calls[0]?.init?.body).toBe(JSON.stringify({ qtd: 1 }));
  });

  it('delete com 404 vira NotFoundError e outros erros passam adiante', async () => {
    const { repository } = repositoryWith({
      '/planoItens/sumiu': { status: 404, body: {} },
      '/planoItens/quebra': { status: 500, body: {} },
    });
    await expect(repository.delete('sumiu')).rejects.toBeInstanceOf(NotFoundError);
    await expect(repository.update('quebra', {})).rejects.toBeInstanceOf(HttpError);
  });
});
