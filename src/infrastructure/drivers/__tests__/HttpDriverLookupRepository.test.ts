import { FetchHttpClient } from '@infrastructure/http/FetchHttpClient';
import { HttpError, InvalidResponseError } from '@infrastructure/http/HttpClient';
import { createFakeFetch, type FakeRoute } from '@test/fakeFetch';
import { createFakeHttpClient } from '@test/fakeHttpClient';
import { HttpDriverLookupRepository } from '../HttpDriverLookupRepository';
import { CAMPOS_TIPO_API, CONFIG_API, INTENSIDADES_API } from './driverApiFixtures';

const BASE = 'http://localhost:3001';

function repositoryFor(routes: Record<string, FakeRoute>) {
  const { fetchFn, calls } = createFakeFetch(routes);
  return {
    repository: new HttpDriverLookupRepository(new FetchHttpClient({ baseUrl: BASE, fetchFn })),
    calls,
  };
}

describe('HttpDriverLookupRepository (registrar-driver §4.2)', () => {
  it('categorias e status dos tipos', async () => {
    const { repository } = repositoryFor({
      '/categorias': {
        body: [{ id: 0, label: 'M', slug: 'midia', labelTipoForm: 'M', tipos: [] }],
      },
      '/tipos': { body: [{ id: 'fv', slug: 'fv', label: 'FV', ativo: false }] },
    });
    await expect(repository.listCategorias()).resolves.toEqual([
      { id: 0, label: 'M', slug: 'midia', tipos: [] },
    ]);
    await expect(repository.listTipos()).resolves.toEqual([{ slug: 'fv', ativo: false }]);
  });

  it('camposTipo sem chaves opcionais ausentes', async () => {
    const { repository } = repositoryFor({ '/camposTipo': { body: CAMPOS_TIPO_API } });
    const [preco] = await repository.listCamposTipo();
    expect(preco?.campos[0]).toEqual(CAMPOS_TIPO_API[0]?.campos[0]);
    expect(preco?.campos[1]).toMatchObject({ readonly: true, step: '0.01', placeholder: 'Auto' });
    expect(Object.keys(preco?.campos[0] ?? {})).not.toContain('placeholder');
  });

  it.each([
    ['select sem options', { label: 'T', required: false, id: 'd_t', param: 't', type: 'select' }],
    [
      'autocomplete sem fonte',
      { label: 'L', required: true, id: 'd_l', param: 'l', type: 'autocomplete' },
    ],
    ['id sem prefixo d_', { label: 'T', required: false, id: 'x', param: 't', type: 'text' }],
  ])('camposTipo com %s → InvalidResponseError', async (_caso, campo) => {
    const { repository } = repositoryFor({
      '/camposTipo': { body: [{ id: 'x', title: 'X', layout: 'g2', campos: [campo] }] },
    });
    await expect(repository.listCamposTipo()).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('intensidades exige exatamente 5', async () => {
    const ok = repositoryFor({ '/intensidades': { body: INTENSIDADES_API } });
    await expect(ok.repository.listIntensidades()).resolves.toHaveLength(5);
    const curto = repositoryFor({ '/intensidades': { body: INTENSIDADES_API.slice(0, 4) } });
    await expect(curto.repository.listIntensidades()).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('config com rótulos, chips e metadados do export', async () => {
    const { repository } = repositoryFor({ '/config': { body: CONFIG_API } });
    await expect(repository.getFormConfig()).resolves.toEqual({
      labels: CONFIG_API.LABEL,
      regioes: CONFIG_API.opcoes.regioes,
      canais: CONFIG_API.opcoes.canais,
      canaisDefault: ['farmacias'],
      exportSchema: 'drivers-demanda-farma-v2.1',
      instrucoesModelagem: ['a', 'b'],
    });
    const invalido = repositoryFor({ '/config': { body: { ...CONFIG_API, exportSchema: '' } } });
    await expect(invalido.repository.getFormConfig()).rejects.toThrow(/exportSchema/);
  });
});

describe('HttpDriverLookupRepository — concorrentes (§4.4, CA-08)', () => {
  const EMS = { id: 'EMS', laboratorio: 'EMS', marcas: ['Genérico EMS', 'Germed'] };

  it('laboratorio_like escapado e limite', async () => {
    const { repository, calls } = repositoryFor({ '/concorrentes': { body: [EMS] } });
    await expect(repository.searchLaboratorios(' a+b ', 20)).resolves.toEqual(['EMS']);
    expect(calls[0]?.url).toBe(`${BASE}/concorrentes?laboratorio_like=a%5C%2Bb&_limit=20`);
    await repository.searchLaboratorios('', 12);
    expect(calls[1]?.url).toBe(`${BASE}/concorrentes?_limit=12`);
  });

  it('marcas do laboratório; 404 → []', async () => {
    const { repository, calls } = repositoryFor({ '/concorrentes/EMS': { body: EMS } });
    await expect(repository.getMarcas('EMS')).resolves.toEqual(['Genérico EMS', 'Germed']);
    await expect(repository.getMarcas('Lab X')).resolves.toEqual([]);
    expect(calls[1]?.url).toBe(`${BASE}/concorrentes/Lab%20X`);
  });

  it('outros erros sobem', async () => {
    const http = createFakeHttpClient({
      get: async () => {
        throw new HttpError(500, 'u', null);
      },
    });
    await expect(new HttpDriverLookupRepository(http).getMarcas('EMS')).rejects.toBeInstanceOf(
      HttpError,
    );
  });
});
