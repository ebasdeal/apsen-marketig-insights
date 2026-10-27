import { LEVOXIN_SKUS, makeFamilia, makeFranquia } from '@test/factories/catalogo';
import { makeDriver } from '@test/factories/drivers';
import {
  createFakeCatalogRepository,
  createFakeDriverRepository,
  createFakeLookupRepository,
} from '@test/fakes/driversRepositories';
import { NotFoundError } from '@domain/shared/DomainError';
import { GetCatalogFilters } from '../GetCatalogFilters';
import { GetFamiliaDrivers } from '../GetFamiliaDrivers';
import { GetFamiliaSkus } from '../GetFamiliaSkus';
import { GetFranquiaSkus } from '../GetFranquiaSkus';
import { ListCatalogFamilias } from '../ListCatalogFamilias';
import { SearchFamilias } from '../SearchFamilias';
import { SearchSkus } from '../SearchSkus';

const QUERY = { busca: ' lev ', franquia: '', familia: '', page: 2, size: 25 };

describe('buscas do formulário (CA-04 registrar)', () => {
  it('SKU e Família com trim e limite 20', async () => {
    const catalog = createFakeCatalogRepository();
    await new SearchSkus(catalog).execute(' lev ');
    expect(catalog.searchSkus).toHaveBeenCalledWith('lev', 20);
    await new SearchFamilias(catalog).execute('MOTILEX HA + MSM');
    expect(catalog.searchFamilias).toHaveBeenCalledWith('MOTILEX HA + MSM', 20);
  });

  it('SKUs da família; 404 → []', async () => {
    const catalog = createFakeCatalogRepository();
    const useCase = new GetFamiliaSkus(catalog);
    await expect(useCase.execute('LEVOXIN')).resolves.toEqual(LEVOXIN_SKUS);
    catalog.getFamilia.mockRejectedValueOnce(new NotFoundError('Família', 'X'));
    await expect(useCase.execute('X')).resolves.toEqual([]);
    catalog.getFamilia.mockRejectedValueOnce(new Error('rede'));
    await expect(useCase.execute('X')).rejects.toThrow('rede');
  });

  it('SKUs da franquia na ordem das famílias', async () => {
    const catalog = createFakeCatalogRepository();
    catalog.listFranquias.mockResolvedValue([makeFranquia({ familias: ['B', 'A'] })]);
    catalog.listFamiliasDaFranquia.mockResolvedValue([
      makeFamilia({ id: 'A', skus: ['a'] }),
      makeFamilia({ id: 'B', skus: [] }),
    ]);
    await expect(new GetFranquiaSkus(catalog).execute('ASTER')).resolves.toEqual([
      { familia: 'B', skus: [] },
      { familia: 'A', skus: ['a'] },
    ]);
    catalog.listFranquias.mockResolvedValue([]);
    const semOrdem = await new GetFranquiaSkus(catalog).execute('ASTER');
    expect(semOrdem.map((item) => item.familia)).toEqual(['A', 'B']);
  });
});

describe('ListCatalogFamilias (CA-02, CA-04, RN-01)', () => {
  it('lista a página com nº de SKUs e de drivers (busca normalizada)', async () => {
    const catalog = createFakeCatalogRepository();
    catalog.listFamilias.mockResolvedValue({
      items: [makeFamilia(), makeFamilia({ id: 'FEMELIV', skus: ['FEMELIV 1 (9999)'] })],
      total: 92,
      page: 2,
      limit: 25,
    });
    const drivers = createFakeDriverRepository([
      makeDriver({ id: '2', modo: 'familia', molecula: 'LEVOXIN', codigo: '', produto: '' }),
      makeDriver({ id: '3' }),
    ]);
    const page = await new ListCatalogFamilias(catalog, drivers).execute(QUERY);
    expect(catalog.listFamilias).toHaveBeenCalledWith({ ...QUERY, busca: 'lev' });
    expect(page).toEqual({
      rows: [
        { franquia: 'ASTER', familia: 'LEVOXIN', nSkus: 3, nDrivers: 2 },
        { franquia: 'ASTER', familia: 'FEMELIV', nSkus: 1, nDrivers: 0 },
      ],
      total: 92,
      page: 2,
      size: 25,
    });
  });
});

describe('GetCatalogFilters (CA-03, RN-04)', () => {
  it('franquias e famílias ordenadas', async () => {
    const catalog = createFakeCatalogRepository();
    catalog.listFranquias.mockResolvedValue([
      makeFranquia({ id: 'LYRA', familias: ['ZETA', 'ALOIS'] }),
      makeFranquia({ id: 'ASTER', familias: ['LEVOXIN'] }),
    ]);
    await expect(new GetCatalogFilters(catalog).execute()).resolves.toEqual({
      franquias: ['ASTER', 'LYRA'],
      familiasPorFranquia: { ASTER: ['LEVOXIN'], LYRA: ['ALOIS', 'ZETA'] },
    });
  });
});

describe('GetFamiliaDrivers (CA-08, CA-09, RN-08)', () => {
  it('drivers da família com badge, nível, estrelas e título vazio como —', async () => {
    const drivers = createFakeDriverRepository([
      makeDriver({
        id: '2',
        modo: 'familia',
        molecula: 'LEVOXIN',
        tipo: 'tv',
        titulo: '',
        intensidadeEsperada: 5,
      }),
      makeDriver({ id: '9', molecula: 'OUTRA', codigo: '', produto: 'OUTRA (1)' }),
    ]);
    const dto = await new GetFamiliaDrivers(
      createFakeCatalogRepository(),
      drivers,
      createFakeLookupRepository(),
    ).execute('LEVOXIN');
    expect(dto).toMatchObject({ franquia: 'ASTER', familia: 'LEVOXIN' });
    expect(dto.drivers).toEqual([
      {
        id: '2',
        badge: { label: '📺 TV Aberta', tone: 'tv' },
        titulo: '—',
        produto: 'LEVOXIN 500MG - 7 COMP. (2300)',
        periodo: '2026-07-15 → 2027-01-15',
        nivel: { label: 'Família', tone: 'familia' },
        intensidade: 5,
        estrelas: '★★★★★',
      },
    ]);
    const comTitulo = await new GetFamiliaDrivers(
      createFakeCatalogRepository(),
      createFakeDriverRepository([makeDriver()]),
      createFakeLookupRepository(),
    ).execute('LEVOXIN');
    expect(comTitulo.drivers[0]?.titulo).toBe('Ajuste de preço Levoxin 500mg Jul/2026');
  });

  it('família inexistente propaga NotFoundError', async () => {
    const catalog = createFakeCatalogRepository();
    catalog.getFamilia.mockRejectedValue(new NotFoundError('Família', 'X'));
    await expect(
      new GetFamiliaDrivers(
        catalog,
        createFakeDriverRepository(),
        createFakeLookupRepository(),
      ).execute('X'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
