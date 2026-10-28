import { TipoValidationError } from '@domain/tipos/errors';
import type { TipoDraft } from '@domain/tipos/Tipo';
import { draftNovo, EXEMPLO_ROW, NOVA_ROW } from '@domain/tipos/vocabulario';
import { createFakeTipoRepository, sequentialIds } from '@test/fakes/tipoRepository';
import { GetTipoForm } from '../GetTipoForm';
import { SaveTipo } from '../SaveTipo';

function draftNovoValido(overrides: Partial<TipoDraft> = {}): TipoDraft {
  return {
    ...draftNovo(),
    slug: 'sazo_novo',
    label: '🌡️ Sazonal Novo',
    cat: 'sazo',
    dono: 'S&OP / Planejamento',
    desc: ' Descrição ',
    rows: [
      { ...EXEMPLO_ROW, nome: 'tipo_epi', label: 'Tipo epidemiológico' },
      {
        ...NOVA_ROW,
        key: 'row-2',
        nome: 'fonte_epi',
        label: 'Fonte',
        tipo: 'select',
        origem: 'api',
        fonte: 'moleculas',
      },
      { ...NOVA_ROW, key: 'row-3' },
    ],
    ...overrides,
  };
}

const RELOGIO = () => new Date('2026-10-28T14:05:00.000Z');

describe('SaveTipo — novo (RN-06, CA-09)', () => {
  it('grava tipo, campos e categoria nessa ordem', async () => {
    const repository = createFakeTipoRepository();
    const result = await new SaveTipo(repository, sequentialIds(), RELOGIO).execute({
      modo: 'novo',
      draft: draftNovoValido(),
      por: 'Ana P.',
    });
    expect(result).toEqual({ toast: '✅ Tipo salvo!' });
    expect(repository.escritas).toEqual([
      'POST /tipos sazo_novo',
      'POST /camposTipo uuid-1',
      'PATCH /categorias/7',
    ]);
    expect(repository.create).toHaveBeenCalledWith({
      id: 'uuid-1',
      slug: 'sazo_novo',
      label: '🌡️ Sazonal Novo',
      cat: 'sazo',
      catL: '🌡️ Sazonalidade',
      dono: 'S&OP / Planejamento',
      feature: 'dummy',
      lag: 0,
      params: 2,
      ativo: true,
      desc: 'Descrição',
      impacto: 'aumento',
      perm: 'temporario',
      nota: '',
      alteradoPor: 'Ana P.',
      alteradoEm: '2026-10-28T14:05:00.000Z',
    });
    expect(repository.saveCampos).toHaveBeenCalledWith(
      {
        id: 'uuid-1',
        title: '🌡️ Sazonal Novo',
        layout: 'g2',
        campos: [
          {
            label: 'Tipo epidemiológico',
            required: true,
            id: 'd_tipo_epi',
            param: 'tipo_epi',
            type: 'select',
            options: ['Epidemia', 'Alta sazonal', 'Pandemia'],
          },
          {
            label: 'Fonte',
            required: false,
            id: 'd_fonte_epi',
            param: 'fonte_epi',
            type: 'select',
            fonte: 'moleculas',
          },
        ],
      },
      false,
    );
    const sazo = repository.categorias.find((categoria) => categoria.slug === 'sazo');
    expect(sazo?.tipos.at(-1)).toEqual({ slug: 'sazo_novo', label: '🌡️ Sazonal Novo' });
  });

  it('slug existente lança TipoValidationError sem gravar (RN-04)', async () => {
    const repository = createFakeTipoRepository();
    const erro = await new SaveTipo(repository, sequentialIds(), RELOGIO)
      .execute({ modo: 'novo', draft: draftNovoValido({ slug: 'tv' }), por: 'x' })
      .catch((error: unknown) => error);
    expect(erro).toBeInstanceOf(TipoValidationError);
    expect((erro as TipoValidationError).fields.slug).toBe('⚠️ Já existe um tipo com este slug.');
    expect((erro as TipoValidationError).message).toBe('⚠️ Já existe um tipo com este slug.');
    expect(repository.escritas).toEqual([]);
  });

  it('erro de linha vira mensagem do erro', async () => {
    const repository = createFakeTipoRepository();
    const draft = draftNovoValido({ rows: [{ ...EXEMPLO_ROW, nome: 'x', label: '' }] });
    await expect(
      new SaveTipo(repository, sequentialIds(), RELOGIO).execute({ modo: 'novo', draft, por: 'x' }),
    ).rejects.toMatchObject({
      message: '⚠️ Campo 1: informe o nome e o label.',
      rows: { 'row-1': '⚠️ Campo 1: informe o nome e o label.' },
    });
    expect(repository.findBySlug).toHaveBeenCalledWith('sazo_novo');
  });

  it('slug vazio não consulta o servidor', async () => {
    const repository = createFakeTipoRepository();
    await expect(
      new SaveTipo(repository, sequentialIds(), RELOGIO).execute({
        modo: 'novo',
        draft: draftNovoValido({ slug: '' }),
        por: 'x',
      }),
    ).rejects.toMatchObject({ message: '⚠️ Informe o slug.' });
    expect(repository.findBySlug).not.toHaveBeenCalled();
  });
});

describe('SaveTipo — editar (RN-06, CA-10)', () => {
  it('troca de categoria faz PATCH sem slug, PUT mantendo layout e duas categorias', async () => {
    const repository = createFakeTipoRepository();
    const { draft } = await new GetTipoForm(repository).execute('tv');
    await new SaveTipo(repository, sequentialIds(), RELOGIO).execute({
      modo: 'editar',
      id: 'tv',
      draft: { ...draft, cat: 'comercial', label: 'TV', lag: '-1' },
      por: 'Carlos L.',
    });
    expect(repository.escritas).toEqual([
      'PATCH /tipos/tv',
      'PUT /camposTipo tv',
      'PATCH /categorias/0',
      'PATCH /categorias/1',
    ]);
    const patch = repository.update.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(patch).not.toHaveProperty('slug');
    expect(patch).not.toHaveProperty('id');
    expect(patch).toMatchObject({
      cat: 'comercial',
      catL: '🛒 Comercial',
      lag: -1,
      alteradoPor: 'Carlos L.',
      alteradoEm: '2026-10-28T14:05:00.000Z',
      params: 6,
      feature: 'continua_grp',
    });
    const campos = repository.campos.find((c) => c.id === 'tv');
    expect(campos).toMatchObject({ layout: 'g3', title: 'TV' });
    expect(repository.categorias[0]?.tipos.some((t) => t.slug === 'tv')).toBe(false);
    expect(repository.categorias[1]?.tipos.at(-1)).toEqual({ slug: 'tv', label: 'TV' });
    expect(repository.findBySlug).not.toHaveBeenCalled();
  });

  it('tipo sem campos faz POST com layout g2', async () => {
    const repository = createFakeTipoRepository();
    repository.getCampos.mockResolvedValueOnce(null);
    const { draft } = await new GetTipoForm(repository).execute('radio');
    repository.getCampos.mockResolvedValueOnce(null);
    await new SaveTipo(repository, sequentialIds(), RELOGIO).execute({
      modo: 'editar',
      id: 'radio',
      draft,
      por: 'x',
    });
    expect(repository.saveCampos).toHaveBeenCalledWith(
      { id: 'radio', title: draft.label, layout: 'g2', campos: [] },
      false,
    );
    expect(repository.updateCategoriaTipos).not.toHaveBeenCalled();
  });
});
