import { createFakeAprovacaoRepository } from '@test/fakes/aprovacaoRepository';
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

describe('CreateDriver (CA-10, RN-02, RN-06, RN-15, RN-TIP-05)', () => {
  const ids = { next: () => 'uuid-novo' };
  const relogio = () => new Date('2026-10-28T14:05:00.000Z');
  const contexto = (perfil: 'area' | 'planejador' | 'admin') => ({
    registrante: { nome: 'Fernanda', perfil },
    tipoLabel: '💻 Digital / Redes',
    categoria: 'midia',
  });
  const criar = (
    drivers = createFakeDriverRepository(),
    aprovacoes = createFakeAprovacaoRepository(),
  ) => ({ aprovacoes, useCase: new CreateDriver(drivers, ids, aprovacoes, relogio) });

  it('valida antes de gravar e lança DriverValidationError', async () => {
    const drivers = createFakeDriverRepository();
    const { useCase, aprovacoes } = criar(drivers);
    const erro = await useCase
      .execute({ draft: makeDraft({ sku: null }), campos: CAMPOS, registro: contexto('area') })
      .catch((error: unknown) => error);
    expect(erro).toBeInstanceOf(DriverValidationError);
    expect(erro).toMatchObject({ field: 'sku', message: '⚠️ Selecione um Produto / SKU.' });
    expect(drivers.create).not.toHaveBeenCalled();
    expect(aprovacoes.create).not.toHaveBeenCalled();
  });

  it('modo Família grava com UUID e sem lista de SKUs (DRV-15)', async () => {
    const drivers = createFakeDriverRepository();
    const draft = makeDraft({ modo: 'familia', sku: null, familia: 'LEVOXIN' });
    const driver = await criar(drivers).useCase.execute({
      draft,
      campos: CAMPOS,
      registro: contexto('admin'),
    });
    expect(driver).toMatchObject({
      id: 'uuid-novo',
      produto: 'LEVOXIN (Família)',
      skusAfetadosIa: [],
    });
    expect(drivers.create).toHaveBeenCalledWith(driver);
  });

  it('modo Franquia grava só o nível, sem lista de SKUs (DRV-15)', async () => {
    const draft = makeDraft({ modo: 'franquia', sku: null, franquia: 'ASTER' });
    const driver = await criar().useCase.execute({
      draft,
      campos: CAMPOS,
      registro: contexto('admin'),
    });
    expect(driver).toMatchObject({ produto: 'ASTER (Franquia)', skusAfetadosIa: [] });
  });

  it('modo SKU grava o código do SKU', async () => {
    const driver = await criar().useCase.execute({
      draft: makeDraft(),
      campos: CAMPOS,
      registro: contexto('admin'),
    });
    expect(driver.codigo).toBe('2300');
  });

  it('Data Fim em branco grava 1 ano após o início', async () => {
    const driver = await criar().useCase.execute({
      draft: makeDraft({ inicio: '2026-07-01', fim: '' }),
      campos: CAMPOS,
      registro: contexto('admin'),
    });
    expect(driver.periodo).toEqual({ inicio: '2026-07-01', fim: '2027-07-01' });
  });

  it('Área registra e o driver entra na Fila como pendente', async () => {
    const { useCase, aprovacoes } = criar();
    await useCase.execute({ draft: makeDraft(), campos: CAMPOS, registro: contexto('area') });
    expect(aprovacoes.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'DRV-2026-035',
        status: 'pendente',
        registrante: 'Fernanda',
        dataReg: '2026-10-28',
        tipo: '💻 Digital / Redes',
        cat: 'midia',
        decisao: null,
      }),
    );
  });

  it.each(['planejador', 'admin'] as const)(
    '%s registra e o driver já nasce aprovado, com ele como aprovador',
    async (perfil) => {
      const { useCase, aprovacoes } = criar();
      await useCase.execute({ draft: makeDraft(), campos: CAMPOS, registro: contexto(perfil) });
      expect(aprovacoes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'aprovado',
          decisao: { tipo: 'aprovado', por: 'Fernanda', em: '2026-10-28T14:05:00.000Z' },
        }),
      );
    },
  );

  it('primeiro registro do ano começa em 001', async () => {
    const aprovacoes = createFakeAprovacaoRepository();
    aprovacoes.maiorId.mockResolvedValue(null);
    await criar(createFakeDriverRepository(), aprovacoes).useCase.execute({
      draft: makeDraft(),
      campos: CAMPOS,
      registro: contexto('area'),
    });
    expect(aprovacoes.create).toHaveBeenCalledWith(expect.objectContaining({ id: 'DRV-2026-001' }));
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
    const driver = await new UpdateDriver(drivers).execute({
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
    const driver = await new UpdateDriver(createFakeDriverRepository([original])).execute({
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
      new UpdateDriver(drivers).execute({
        id: '2',
        draft: makeDraft({ inicio: '' }),
        campos: CAMPOS,
        original,
      }),
    ).rejects.toMatchObject({ field: 'inicio' });
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
