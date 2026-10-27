import { makeDriver } from '@test/factories/drivers';
import {
  createFakeDriverRepository,
  createFakeLookupRepository,
} from '@test/fakes/driversRepositories';
import { NotFoundError } from '@domain/shared/DomainError';
import { DeleteDriver } from '../DeleteDriver';
import { GetDriversExport } from '../GetDriversExport';
import { ListDrivers } from '../ListDrivers';

const DRIVER_1 = makeDriver({
  id: '1',
  produto: 'Baricitinibe 2mg (SKU-00312)',
  titulo: 'Campanha Instagram Jul/2026',
  periodo: { inicio: '2026-07-01', fim: '2026-07-31' },
  tipo: 'digital',
  cobertura: { regioes: ['nacional'], canais: ['farmacias'] },
  intensidadeEsperada: 4,
  verbaRs: 250000,
  observacoes: 'Teste de registro',
  parametros: { plataforma: 'Instagram', formato: 'Reels', impressoes: '2400000' },
});

describe('ListDrivers (CA-02, CA-03, RN-01, RN-03)', () => {
  it('pede a página ao repositório e monta os itens', async () => {
    const drivers = createFakeDriverRepository([DRIVER_1]);
    const lookups = createFakeLookupRepository();
    const page = await new ListDrivers(drivers, lookups).execute({ page: 1, size: 10 });
    expect(drivers.list).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(page).toMatchObject({ total: 1, page: 1, size: 10 });
    expect(page.items[0]).toEqual({
      id: '1',
      badge: { label: '💻 Digital', tone: 'tv' },
      titulo: 'Baricitinibe 2mg (SKU-00312) — Campanha Instagram Jul/2026',
      periodo: '2026-07-01 → 2026-07-31',
      estrelas: '★★★★☆',
      verba: 250000,
      canais: ['farmacias'],
      parametros: [
        { chave: 'plataforma', valor: 'Instagram' },
        { chave: 'formato', valor: 'Reels' },
        { chave: 'impressoes', valor: '2400000' },
      ],
      observacoes: 'Teste de registro',
    });
  });

  it('verba nula ou zero não aparece', async () => {
    const drivers = createFakeDriverRepository([
      makeDriver({ id: 'a', verbaRs: null }),
      makeDriver({ id: 'b', verbaRs: 0 }),
    ]);
    const page = await new ListDrivers(drivers, createFakeLookupRepository()).execute({
      page: 1,
      size: 10,
    });
    expect(page.items.map((item) => item.verba)).toEqual([null, null]);
  });

  it('pagina 2 de 60', async () => {
    const todos = Array.from({ length: 60 }, (_, i) => makeDriver({ id: String(i + 1) }));
    const page = await new ListDrivers(
      createFakeDriverRepository(todos),
      createFakeLookupRepository(),
    ).execute({ page: 2, size: 10 });
    expect(page.total).toBe(60);
    expect(page.items.map((item) => item.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => String(i + 11)),
    );
  });
});

describe('DeleteDriver (CA-04, RN-04)', () => {
  it('remove pelo id e trata 404 como sucesso', async () => {
    const drivers = createFakeDriverRepository();
    const useCase = new DeleteDriver(drivers);
    await useCase.execute('1');
    expect(drivers.remove).toHaveBeenCalledWith('1');
    drivers.remove.mockRejectedValueOnce(new NotFoundError('Driver', '1'));
    await expect(useCase.execute('1')).resolves.toBeUndefined();
    drivers.remove.mockRejectedValueOnce(new Error('500'));
    await expect(useCase.execute('1')).rejects.toThrow('500');
  });
});

describe('GetDriversExport (CA-05, CA-06, RN-05, RN-06)', () => {
  const clock = () => new Date('2026-10-27T12:00:00.000Z');

  it('texto JSON com schema, instante do clock e nome do arquivo', async () => {
    const drivers = createFakeDriverRepository([DRIVER_1, makeDriver({ id: '2' })]);
    const dto = await new GetDriversExport(drivers, createFakeLookupRepository(), clock).execute();
    const json = JSON.parse(dto.texto);
    expect(json).toMatchObject({
      schema: 'drivers-demanda-farma-v2.1',
      exportado_em: '2026-10-27T12:00:00.000Z',
      total_registros: 2,
    });
    expect(json.drivers[0].id).toBe('1');
    expect(dto).toMatchObject({ nomeArquivo: 'drivers_demanda_v2_2026-10-27.json', total: 2 });
    expect(drivers.listAll).toHaveBeenCalled();
  });

  it('sem drivers → "Nenhum registro."', async () => {
    const dto = await new GetDriversExport(
      createFakeDriverRepository([]),
      createFakeLookupRepository(),
      clock,
    ).execute();
    expect(dto).toMatchObject({ texto: 'Nenhum registro.', total: 0 });
  });
});
