import { formularioInclusaoVazio } from '@domain/planos/planoRules';
import { formularioVazio } from '@domain/restricoes/restricaoRules';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { createFakeFetch } from '@test/fakeFetch';
import { PLANO_FILTRO_PADRAO } from '@test/fakes/planos';
import { CICLO_DTOS_FIXTURE } from '@test/fixtures/ciclos';
import { createContainer } from '../../container';
import { createPlanosModule } from '../planos';
import { createRestricoesModule } from '../restricoes';

const BASE = 'http://localhost:3001';
const ENV = { apiUrl: BASE, authMode: 'simulado' as const };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const RESTRICAO = {
  id: 'RST-022',
  codigo: 'RST-022',
  tipo: 'mp',
  label: '🧪 Matéria-Prima',
  desc: 'Falta',
  impCor: 'critica',
  sev: 'critica',
  status: 'ativa',
};

const META = { id: 'SKU-00058', nome: 'Apixabana 5mg', apres: 'Blister 60cp', familia: 'Cardio' };

const ITEM = {
  id: 'PLP-2026-07-247',
  codigo: 'PLP-2026-07-247',
  sku: 'SKU-00058',
  nome: 'Apixabana 5mg',
  qtd: 1,
  linha: 'Linha 1',
  semana: 'S27 (30/06–06/07)',
  status: 'pendente',
};

describe('createContainer com restrições e planos', () => {
  it('registra os módulos sobre o mesmo cliente HTTP com token', async () => {
    const { fetchFn, calls } = createFakeFetch({
      '/restricoes': { body: [RESTRICAO], headers: { 'X-Total-Count': '8' } },
      '/planoItens': { body: [ITEM], headers: { 'X-Total-Count': '247' } },
    });
    const { useCases } = createContainer(ENV, { fetchFn });
    await expect(useCases.restricoes.contar.execute()).resolves.toEqual({
      ativas: 8,
      resolvidas: 8,
    });
    await expect(useCases.planos.contar.execute()).resolves.toBe(247);
    expect(calls[0]?.init?.headers).toMatchObject({ Authorization: 'Bearer tok-admin' });
    expect(Object.keys(useCases)).toEqual(expect.arrayContaining(['restricoes', 'planos']));
  });
});

describe('createRestricoesModule', () => {
  it('gera UUID por padrão e usa o relógio injetado', async () => {
    const http = createFakeHttpClient({
      get: async () => [RESTRICAO],
      post: async (_path, body) => body,
      patch: async () => ({ ...RESTRICAO, status: 'resolvida', resolucao: 'ok' }),
    });
    const modulo = createRestricoesModule(http, { now: () => new Date(2026, 9, 27) });
    const result = await modulo.registrar.execute({ ...formularioVazio(), tipo: 'mp', desc: 'x' });
    expect(result.id).toMatch(UUID);
    expect(result.codigo).toBe('RST-023');
    await modulo.resolver.execute('RST-022');
    expect(http.patch).toHaveBeenCalledWith('restricoes/RST-022', {
      status: 'resolvida',
      resolucao: 'Resolvida em 27/10/2026',
    });
    await createRestricoesModule(http).resolver.execute('RST-022');
    expect(http.patch).toHaveBeenLastCalledWith('restricoes/RST-022', {
      status: 'resolvida',
      resolucao: expect.stringMatching(/^Resolvida em \d{2}\/\d{2}\/\d{4}$/),
    });
    expect(Object.keys(createRestricoesModule(http))).toEqual([
      'list',
      'contar',
      'registrar',
      'atualizar',
      'resolver',
      'resumo',
    ]);
  });
});

describe('createPlanosModule', () => {
  it('inclui com UUID padrão e código do ciclo ativo', async () => {
    const respostas: Record<string, unknown> = {
      'skuMeta?id=SKU-00058': [META],
      planoItens: [ITEM],
    };
    const http = createFakeHttpClient({
      get: async (path) => respostas[path] ?? [],
      getPage: async () => ({ data: [CICLO_DTOS_FIXTURE[0]], total: 1 }),
      post: async (_path, body) => body,
    });
    const modulo = createPlanosModule(http);
    const result = await modulo.incluir.execute({
      ...formularioInclusaoVazio(),
      sku: 'SKU-00058',
      qtd: '50000',
    });
    expect(result.id).toMatch(UUID);
    expect(result.codigo).toBe('PLP-2026-07-248');
    expect(http.post).toHaveBeenCalledWith(
      'planoItens',
      expect.objectContaining({ status: 'pendente', familia: 'Cardio' }),
    );
    expect(http.getPage).toHaveBeenCalledWith('/ciclos', expect.anything());
    http.getPage.mockImplementation(async (path: string) =>
      path === '/ciclos' ? { data: [], total: 0 } : { data: [ITEM], total: 1 },
    );
    await expect(modulo.list.execute(PLANO_FILTRO_PADRAO)).resolves.toMatchObject({ ciclo: null });
    expect(Object.keys(modulo)).toEqual([
      'list',
      'contar',
      'get',
      'skusInclusao',
      'incluir',
      'atualizar',
      'excluir',
      'resumo',
    ]);
  });
});
