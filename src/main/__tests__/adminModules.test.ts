import { createFakeFetch } from '@test/fakeFetch';
import { APROVACOES_API } from '@test/fixtures/aprovacoes';
import { INGERIDOS_API } from '@test/fixtures/ingeridos';
import { TIPOS_API } from '@test/fixtures/tipos';
import { createContainer } from '../container';

const ENV = { apiUrl: 'http://localhost:3001', authMode: 'simulado' as const };

describe('createContainer — tipos, aprovações e ingeridos', () => {
  it('liga os casos de uso aos repositórios HTTP com o token da sessão', async () => {
    const total = (n: number) => ({ 'X-Total-Count': String(n) });
    const { fetchFn, calls } = createFakeFetch({
      '/tipos': { body: TIPOS_API.slice(0, 10), headers: total(47) },
      '/aprovacoes': { body: APROVACOES_API.slice(0, 5), headers: total(14) },
      '/config': { body: { APROV_INGERIDOS: ['DRV-2026-032'] } },
      '/ingeridos': { body: INGERIDOS_API, headers: total(4) },
    });
    const { tipos, aprovacoes, ingeridos } = createContainer(ENV, { fetchFn }).useCases;

    await expect(tipos.list.execute({ page: 1, size: 10 })).resolves.toMatchObject({ total: 47 });
    await expect(
      aprovacoes.list.execute({
        filtro: { q: '', ini: '', fim: '', tipo: '', status: '' },
        page: 1,
      }),
    ).resolves.toMatchObject({ total: 14, totalPages: 3 });
    await expect(aprovacoes.pendentes.execute()).resolves.toBe(14);
    await expect(aprovacoes.emUso.execute()).resolves.toEqual(['DRV-2026-032']);
    await expect(
      ingeridos.list.execute({ filtro: { q: '', categoria: '' }, page: 1 }),
    ).resolves.toMatchObject({ resumo: '4 drivers' });
    expect(calls.every((call) => call.init?.headers)).toBe(true);
    expect(calls[0]?.init?.headers).toMatchObject({ Authorization: 'Bearer tok-admin' });
    expect(Object.keys(tipos)).toEqual([
      'list',
      'categorias',
      'getForm',
      'save',
      'toggle',
      'remove',
      'importar',
    ]);
    expect(Object.keys(aprovacoes)).toEqual([
      'list',
      'pendentes',
      'emUso',
      'aprovar',
      'rejeitar',
      'reabrir',
    ]);
    expect(Object.keys(ingeridos)).toEqual(['list', 'remove']);
  });
});
