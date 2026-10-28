import { CatalogoImportError } from '@domain/tipos/errors';
import { createFakeTipoRepository, sequentialIds } from '@test/fakes/tipoRepository';
import { ImportCatalogo } from '../ImportCatalogo';

const CATALOGO = JSON.stringify({
  schema: 'drivers-catalogo-v1',
  tipos: [
    {
      slug: 'tv',
      label: 'TV Aberta 2',
      cat: 'midia',
      dono: 'Marketing',
      lag: 2,
      campos: [{ param: 'canal', label: 'Canal', type: 'text' }],
    },
    { slug: 'radio', label: 'Rádio', cat: 'comercial', dono: 'Marketing' },
    {
      slug: 'sazo_x',
      label: 'Sazo X',
      cat: 'sazo',
      dono: 'S&OP / Planejamento',
      campos: [{ param: 'a', label: 'A' }],
    },
    { slug: 'sazo_y', label: 'Sazo Y', cat: 'sazo', dono: 'S&OP / Planejamento' },
  ],
});

const RELOGIO = () => new Date('2026-10-28T14:05:00.000Z');

describe('ImportCatalogo (RN-09, CA-06)', () => {
  it('atualiza existentes, insere novos e mantém categorias coerentes', async () => {
    const repository = createFakeTipoRepository();
    const result = await new ImportCatalogo(repository, sequentialIds(), RELOGIO).execute(
      CATALOGO,
      'Ana P.',
    );
    expect(result).toEqual({ toast: '✅ Catálogo importado!', inseridos: 2, atualizados: 2 });
    expect(repository.update).toHaveBeenCalledWith('tv', {
      label: 'TV Aberta 2',
      cat: 'midia',
      catL: '📡 Mídia',
      dono: 'Marketing',
      lag: 2,
      params: 1,
      alteradoPor: 'Ana P.',
      alteradoEm: '2026-10-28T14:05:00.000Z',
    });
    expect(repository.update).toHaveBeenCalledWith('radio', {
      label: 'Rádio',
      cat: 'comercial',
      catL: '🛒 Comercial',
      dono: 'Marketing',
      alteradoPor: 'Ana P.',
      alteradoEm: '2026-10-28T14:05:00.000Z',
    });
    expect(repository.campos.find((c) => c.id === 'tv')).toMatchObject({
      layout: 'g3',
      title: 'TV Aberta 2',
      campos: [{ id: 'd_canal', param: 'canal', type: 'text', required: false }],
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'uuid-1',
        slug: 'sazo_x',
        feature: 'dummy',
        lag: 0,
        ativo: true,
        params: 1,
        desc: '',
        nota: '',
        catL: '🌡️ Sazonalidade',
      }),
    );
    expect(repository.campos.find((c) => c.id === 'uuid-2')).toEqual({
      id: 'uuid-2',
      title: 'Sazo Y',
      layout: 'g2',
      campos: [],
    });
    const [midia, comercial] = repository.categorias;
    expect(midia?.tipos.find((t) => t.slug === 'tv')?.label).toBe('TV Aberta 2');
    expect(midia?.tipos.some((t) => t.slug === 'radio')).toBe(false);
    expect(comercial?.tipos.at(-1)).toEqual({ slug: 'radio', label: 'Rádio' });
    const sazo = repository.categorias.find((c) => c.slug === 'sazo');
    expect(sazo?.tipos.slice(-2).map((t) => t.slug)).toEqual(['sazo_x', 'sazo_y']);
  });

  it('existente com campos e sem camposTipo faz POST', async () => {
    const repository = createFakeTipoRepository();
    repository.getCampos.mockResolvedValueOnce(null);
    await new ImportCatalogo(repository, sequentialIds(), RELOGIO).execute(
      JSON.stringify({
        schema: 'drivers-catalogo-v1',
        tipos: [{ slug: 'tv', label: 'TV', cat: 'midia', dono: 'Marketing', campos: [] }],
      }),
      'Ana P.',
    );
    expect(repository.saveCampos).toHaveBeenCalledWith(
      { id: 'tv', title: 'TV', layout: 'g2', campos: [] },
      false,
    );
  });

  it('JSON inválido lança CatalogoImportError e nada é gravado', async () => {
    const repository = createFakeTipoRepository();
    const erro = await new ImportCatalogo(repository, sequentialIds(), RELOGIO)
      .execute('{x', 'Ana P.')
      .catch((error: unknown) => error);
    expect(erro).toBeInstanceOf(CatalogoImportError);
    expect((erro as Error).message).toBe('⚠️ JSON inválido — verifique a sintaxe.');
    expect(repository.escritas).toEqual([]);
    expect(repository.listCategorias).not.toHaveBeenCalled();
  });
});
