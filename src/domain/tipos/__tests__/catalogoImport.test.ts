import { CATALOGO_SCHEMA, parseCatalogoImport } from '../catalogoImport';

function catalogo(tipos: unknown, schema: unknown = CATALOGO_SCHEMA): string {
  return JSON.stringify({ schema, tipos });
}

const VALIDO = {
  slug: 'sazo_epi',
  label: '🌡️ Sazonal / Epidemiológico',
  cat: 'sazo',
  dono: 'S&OP / Planejamento',
  feature: 'fourier_sazo',
  lag: 0,
  ativo: true,
  campos: [
    { param: 'tipo_epi', label: 'Tipo', type: 'select', required: true, options: ['Epidemia'] },
  ],
};

describe('parseCatalogoImport (RN-09)', () => {
  it.each([
    ['texto vazio', '  ', '⚠️ Cole o JSON do catálogo.'],
    ['JSON inválido', '{"schema":', '⚠️ JSON inválido — verifique a sintaxe.'],
    [
      'schema errado',
      catalogo([VALIDO], 'outro'),
      '⚠️ Schema não reconhecido — use drivers-catalogo-v1.',
    ],
    ['raiz não-objeto', '[1,2]', '⚠️ Schema não reconhecido — use drivers-catalogo-v1.'],
    ['tipos não-array', catalogo({}), '⚠️ Nenhum tipo encontrado no JSON.'],
    ['tipos vazio', catalogo([]), '⚠️ Nenhum tipo encontrado no JSON.'],
    [
      'item sem dono',
      catalogo([VALIDO, { ...VALIDO, slug: 'b', dono: '' }]),
      '⚠️ Tipo 2: informe slug, label, categoria e dono válidos.',
    ],
    [
      'slug inválido',
      catalogo([{ ...VALIDO, slug: 'Sazo Epi' }]),
      '⚠️ Tipo 1: informe slug, label, categoria e dono válidos.',
    ],
    [
      'categoria inválida',
      catalogo([{ ...VALIDO, cat: 'xyz' }]),
      '⚠️ Tipo 1: informe slug, label, categoria e dono válidos.',
    ],
    [
      'item não-objeto',
      catalogo(['x']),
      '⚠️ Tipo 1: informe slug, label, categoria e dono válidos.',
    ],
    [
      'campos malformados',
      catalogo([{ ...VALIDO, campos: [{ label: 'sem param' }] }]),
      '⚠️ Tipo 1: informe slug, label, categoria e dono válidos.',
    ],
    [
      'campos não-array',
      catalogo([{ ...VALIDO, campos: 'x' }]),
      '⚠️ Tipo 1: informe slug, label, categoria e dono válidos.',
    ],
    [
      'tipo de campo inválido',
      catalogo([{ ...VALIDO, campos: [{ param: 'a', label: 'A', type: 'radio' }] }]),
      '⚠️ Tipo 1: informe slug, label, categoria e dono válidos.',
    ],
    [
      'slug repetido',
      catalogo([VALIDO, { ...VALIDO, label: 'Outro' }]),
      '⚠️ Tipo 2: slug repetido no arquivo.',
    ],
  ])('%s', (_caso, texto, erro) => {
    expect(parseCatalogoImport(texto)).toEqual({ ok: false, erro });
  });

  it('válido devolve os tipos normalizados', () => {
    const result = parseCatalogoImport(
      catalogo([
        { ...VALIDO, slug: ' sazo_epi ', label: ' Sazonal ', desc: 'd', lag: 1.5, ativo: 'sim' },
        {
          slug: 'minimo',
          label: 'Mínimo',
          cat: 'macro',
          dono: 'Financeiro',
          campos: [
            {
              param: 'grp',
              label: 'GRP',
              id: 'x_grp',
              placeholder: 'p',
              options: [{ label: 'A', group: 'G' }],
            },
          ],
        },
        { slug: 'sem_campos', label: 'S', cat: 'midia', dono: 'Marketing' },
      ]),
    );
    expect(result).toEqual({
      ok: true,
      tipos: [
        {
          slug: 'sazo_epi',
          label: 'Sazonal',
          cat: 'sazo',
          dono: 'S&OP / Planejamento',
          feature: 'fourier_sazo',
          desc: 'd',
          campos: [
            {
              label: 'Tipo',
              required: true,
              id: 'd_tipo_epi',
              param: 'tipo_epi',
              type: 'select',
              options: ['Epidemia'],
            },
          ],
        },
        {
          slug: 'minimo',
          label: 'Mínimo',
          cat: 'macro',
          dono: 'Financeiro',
          campos: [
            {
              label: 'GRP',
              required: false,
              id: 'x_grp',
              param: 'grp',
              type: 'text',
              placeholder: 'p',
              options: [{ label: 'A', group: 'G' }],
            },
          ],
        },
        { slug: 'sem_campos', label: 'S', cat: 'midia', dono: 'Marketing' },
      ],
    });
  });

  it('aceita lag inteiro e ativo booleano', () => {
    const result = parseCatalogoImport(catalogo([{ ...VALIDO, lag: -2, ativo: false }]));
    expect(result.ok && result.tipos[0]).toMatchObject({ lag: -2, ativo: false });
  });
});
