import { makeFamilia, makeFranquia } from '@test/factories/catalogo';
import { CATEGORIAS, makeCamposTipo, makeDraft, makeDriver } from '@test/factories/drivers';
import {
  createFakeCatalogRepository,
  createFakeDriverRepository,
  createFakeLookupRepository,
} from '@test/fakes/driversRepositories';
import { DriverValidationError } from '@domain/drivers/errors';
import { NotFoundError } from '@domain/shared/DomainError';
import { CreateDriver } from '../CreateDriver';
import { GetDriverForForm } from '../GetDriverForForm';
import { GetDriverFormLookups } from '../GetDriverFormLookups';
import { SearchLaboratorios } from '../SearchLaboratorios';
import { SearchMarcas } from '../SearchMarcas';
import { UpdateDriver } from '../UpdateDriver';

const CAMPOS = makeCamposTipo().campos;

describe('GetDriverFormLookups (CA-01, CA-05)', () => {
  it('compõe os lookups em paralelo, ordena categorias e filtra tipos inativos', async () => {
    const lookups = createFakeLookupRepository();
    lookups.listCategorias.mockResolvedValue([...CATEGORIAS].reverse());
    lookups.listIntensidades.mockResolvedValue(
      [...(await createFakeLookupRepository().listIntensidades())].reverse(),
    );
    const catalog = createFakeCatalogRepository();
    const dto = await new GetDriverFormLookups(lookups, catalog).execute();
    expect(dto.categorias.map((categoria) => categoria.id)).toEqual([0, 1, 5]);
    expect(dto.intensidades.map((info) => info.id)).toEqual([1, 2, 3, 4, 5]);
    expect(dto.tiposAtivos).not.toContain('fv');
    expect(dto.tiposAtivos).toContain('preco');
    expect(Object.keys(dto.camposPorTipo)).toEqual(['concorrente']);
    expect(dto.franquias).toEqual([makeFranquia()]);
    expect(dto.config.canaisDefault).toEqual(['farmacias']);
  });
});

describe('GetDriverForForm (CA-12, CA-13, CA-14)', () => {
  it('modo SKU resolve o SKU por findSku(produto, codigo)', async () => {
    const catalog = createFakeCatalogRepository();
    const dto = await new GetDriverForForm(createFakeDriverRepository(), catalog).execute('3');
    expect(catalog.findSku).toHaveBeenCalledWith('LEVOXIN 500MG - 7 COMP. (2300)', '2300');
    expect(dto.familia).toBeNull();
    expect(dto.sku?.familia).toBe('LEVOXIN');
    expect(catalog.getFamilia).not.toHaveBeenCalled();
  });

  it('modo Família busca a família; 404 vira null', async () => {
    const driver = makeDriver({ id: '2', modo: 'familia', molecula: 'LEVOXIN' });
    const catalog = createFakeCatalogRepository();
    const useCase = new GetDriverForForm(createFakeDriverRepository([driver]), catalog);
    await expect(useCase.execute('2')).resolves.toMatchObject({
      sku: null,
      familia: makeFamilia(),
    });
    catalog.getFamilia.mockRejectedValueOnce(new NotFoundError('Família', 'LEVOXIN'));
    await expect(useCase.execute('2')).resolves.toMatchObject({ familia: null });
    catalog.getFamilia.mockRejectedValueOnce(new Error('rede'));
    await expect(useCase.execute('2')).rejects.toThrow('rede');
  });

  it('modo Franquia não resolve produto e id inexistente lança NotFoundError', async () => {
    const driver = makeDriver({ id: '9', modo: 'franquia', molecula: 'ASTER' });
    const catalog = createFakeCatalogRepository();
    const useCase = new GetDriverForForm(createFakeDriverRepository([driver]), catalog);
    await expect(useCase.execute('9')).resolves.toMatchObject({ sku: null, familia: null });
    await expect(useCase.execute('x')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('CreateDriver (CA-10, RN-02, RN-06, RN-15)', () => {
  const ids = { next: () => 'uuid-novo' };

  it('valida antes de gravar e lança DriverValidationError', async () => {
    const drivers = createFakeDriverRepository();
    const useCase = new CreateDriver(drivers, createFakeCatalogRepository(), ids);
    const erro = await useCase
      .execute({ draft: makeDraft({ sku: null }), campos: CAMPOS })
      .catch((error: unknown) => error);
    expect(erro).toBeInstanceOf(DriverValidationError);
    expect(erro).toMatchObject({ field: 'sku', message: '⚠️ Selecione um Produto / SKU.' });
    expect(drivers.create).not.toHaveBeenCalled();
  });

  it('modo Família grava com UUID e os códigos dos SKUs da família', async () => {
    const drivers = createFakeDriverRepository();
    const catalog = createFakeCatalogRepository();
    const draft = makeDraft({ modo: 'familia', sku: null, familia: 'LEVOXIN' });
    const driver = await new CreateDriver(drivers, catalog, ids).execute({ draft, campos: CAMPOS });
    expect(catalog.getFamilia).toHaveBeenCalledWith('LEVOXIN');
    expect(driver).toMatchObject({
      id: 'uuid-novo',
      produto: 'LEVOXIN (Família)',
      skusAfetadosIa: ['2298', '2299', '2300'],
    });
    expect(drivers.create).toHaveBeenCalledWith(driver);
  });

  it('modo Franquia agrega as famílias na ordem de franquias[f].familias', async () => {
    const catalog = createFakeCatalogRepository();
    catalog.listFranquias.mockResolvedValue([
      makeFranquia({ id: 'LYRA', familias: [] }),
      makeFranquia({ id: 'ASTER', familias: ['FEMELIV', 'LEVOXIN'] }),
    ]);
    catalog.listFamiliasDaFranquia.mockResolvedValue([
      makeFamilia({ id: 'LEVOXIN', skus: ['L (2300)'] }),
      makeFamilia({ id: 'NOVA', skus: ['N (1)'] }),
      makeFamilia({ id: 'FEMELIV', skus: ['F (1000)', 'F2'] }),
    ]);
    const draft = makeDraft({ modo: 'franquia', sku: null, franquia: 'ASTER' });
    const driver = await new CreateDriver(createFakeDriverRepository(), catalog, ids).execute({
      draft,
      campos: CAMPOS,
    });
    expect(catalog.listFamiliasDaFranquia).toHaveBeenCalledWith('ASTER');
    expect(driver.skusAfetadosIa).toEqual(['1000', 'F2', '2300', '1']);
  });

  it('modo SKU não consulta o catálogo', async () => {
    const catalog = createFakeCatalogRepository();
    const driver = await new CreateDriver(createFakeDriverRepository(), catalog, ids).execute({
      draft: makeDraft(),
      campos: CAMPOS,
    });
    expect(driver.codigo).toBe('2300');
    expect(catalog.getFamilia).not.toHaveBeenCalled();
    expect(catalog.listFranquias).not.toHaveBeenCalled();
  });
});

describe('UpdateDriver (CA-13, RN-08, RN-15)', () => {
  const original = makeDriver({
    id: '2',
    tipo: 'concorrente',
    parametros: { emissora: 'Globo', lab_conc: 'EMS' },
  });

  it('PUT com o mesmo id preservando chaves antigas do mesmo tipo', async () => {
    const drivers = createFakeDriverRepository([original]);
    const driver = await new UpdateDriver(drivers, createFakeCatalogRepository()).execute({
      id: '2',
      draft: makeDraft(),
      campos: CAMPOS,
      original,
    });
    expect(driver.id).toBe('2');
    expect(driver.parametros.emissora).toBe('Globo');
    expect(drivers.update).toHaveBeenCalledWith(driver);
  });

  it('trocando o tipo, as chaves antigas somem', async () => {
    const driver = await new UpdateDriver(
      createFakeDriverRepository([original]),
      createFakeCatalogRepository(),
    ).execute({
      id: '2',
      draft: makeDraft(),
      campos: CAMPOS,
      original: { ...original, tipo: 'tv' },
    });
    expect(driver.parametros.emissora).toBeUndefined();
  });

  it('valida o draft', async () => {
    const drivers = createFakeDriverRepository([original]);
    await expect(
      new UpdateDriver(drivers, createFakeCatalogRepository()).execute({
        id: '2',
        draft: makeDraft({ fim: '' }),
        campos: CAMPOS,
        original,
      }),
    ).rejects.toMatchObject({ field: 'fim' });
    expect(drivers.update).not.toHaveBeenCalled();
  });
});

describe('SearchLaboratorios / SearchMarcas (CA-08, RN-11)', () => {
  it('laboratórios: vazio → 12, termo → 20 com trim', async () => {
    const lookups = createFakeLookupRepository();
    const useCase = new SearchLaboratorios(lookups);
    await useCase.execute('  ');
    expect(lookups.searchLaboratorios).toHaveBeenLastCalledWith('', 12);
    await expect(useCase.execute(' em ')).resolves.toEqual(['EMS']);
    expect(lookups.searchLaboratorios).toHaveBeenLastCalledWith('em', 20);
  });

  it('marcas exigem laboratório e são filtradas pelo termo', async () => {
    const lookups = createFakeLookupRepository();
    const useCase = new SearchMarcas(lookups);
    await expect(useCase.execute({ laboratorio: ' ', termo: 'g' })).resolves.toEqual([]);
    expect(lookups.getMarcas).not.toHaveBeenCalled();
    await expect(useCase.execute({ laboratorio: ' EMS ', termo: 'ge' })).resolves.toEqual([
      'Genérico EMS',
      'Germed',
    ]);
    expect(lookups.getMarcas).toHaveBeenCalledWith('EMS');
  });
});
