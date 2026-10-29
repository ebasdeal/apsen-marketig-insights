import { CAMPOS_TIPO, camposFixture, categoriasFixture } from '@test/fixtures/tipos';
import type { ParamRow, TipoDraft } from '../Tipo';
import {
  aplicarCategoriaPatches,
  camposToRows,
  catLabelCurto,
  categoriaPatches,
  featureTone,
  formatLag,
  parseLag,
  primeiraMensagem,
  rowsToCampos,
  SLUG_REGEX,
  validateTipoDraft,
} from '../tipoRules';
import { draftNovo, EXEMPLO_ROW, NOVA_ROW } from '../vocabulario';

function row(overrides: Partial<ParamRow> = {}): ParamRow {
  return { ...NOVA_ROW, key: 'r', nome: 'campo', label: 'Campo', ...overrides };
}

function draftValido(overrides: Partial<TipoDraft> = {}): TipoDraft {
  return {
    ...draftNovo(),
    slug: 'sazo_epi',
    label: '🌡️ Sazonal / Epidemiológico',
    cat: 'sazo',
    dono: 'S&OP / Planejamento',
    rows: [{ ...EXEMPLO_ROW, nome: 'tipo_epi', label: 'Tipo epidemiológico' }],
    ...overrides,
  };
}

const NOVO = { modo: 'novo' as const, slugExiste: false };

describe('formatLag e featureTone (RN-02)', () => {
  it('formata lag positivo, zero e negativo', () => {
    expect(formatLag(1)).toBe('+1');
    expect(formatLag(0)).toBe('0');
    expect(formatLag(-1)).toBe('-1');
  });

  it('mapeia a cor da feature com fallback muted', () => {
    expect(featureTone('dummy_censored')).toBe('red');
    expect(featureTone('continua_grp')).toBe('teal');
    expect(featureTone('desconhecida')).toBe('muted');
  });

  it('usa o rótulo curto do chip como catL', () => {
    expect(catLabelCurto('sazo')).toBe('🌡️ Sazonalidade');
    expect(catLabelCurto('midia')).toBe('📡 Mídia');
  });

  it('parseLag aceita inteiros entre -3 e 6', () => {
    expect(parseLag(' -3 ')).toBe(-3);
    expect(parseLag('6')).toBe(6);
    expect(parseLag('7')).toBeNull();
    expect(parseLag('-4')).toBeNull();
    expect(parseLag('1.5')).toBeNull();
    expect(parseLag('')).toBeNull();
  });
});

describe('validateTipoDraft (RN-04)', () => {
  it('rascunho válido não tem erros', () => {
    const validation = validateTipoDraft(draftValido(), NOVO);
    expect(validation).toEqual({ fields: {}, rows: {} });
    expect(primeiraMensagem(validation)).toBeNull();
  });

  it('acusa as mensagens por campo na ordem', () => {
    const validation = validateTipoDraft(
      draftValido({ slug: '', label: ' ', cat: '', dono: '', lag: '7' }),
      NOVO,
    );
    expect(validation.fields).toEqual({
      slug: '⚠️ Informe o slug.',
      label: '⚠️ Informe o label.',
      cat: '⚠️ Selecione a categoria.',
      dono: '⚠️ Selecione o dono de área.',
      lag: '⚠️ O lag deve ser um número inteiro entre -3 e 6.',
    });
    expect(Object.keys(validation.fields)).toEqual(['slug', 'label', 'cat', 'dono', 'lag']);
    expect(primeiraMensagem(validation)).toBe('⚠️ Informe o slug.');
  });

  it('slug fora do regex e slug existente só em novo', () => {
    expect(validateTipoDraft(draftValido({ slug: 'Sazo Epi' }), NOVO).fields.slug).toBe(
      '⚠️ Slug inválido — use letras minúsculas, números e underscore.',
    );
    expect(validateTipoDraft(draftValido(), { modo: 'novo', slugExiste: true }).fields.slug).toBe(
      '⚠️ Já existe um tipo com este slug.',
    );
    expect(
      validateTipoDraft(draftValido(), { modo: 'editar', slugExiste: true }).fields.slug,
    ).toBeUndefined();
  });

  it('lag decimal é inválido', () => {
    expect(validateTipoDraft(draftValido({ lag: '1.5' }), NOVO).fields.lag).toBe(
      '⚠️ O lag deve ser um número inteiro entre -3 e 6.',
    );
  });

  it('SLUG_REGEX exige letra minúscula inicial', () => {
    expect(SLUG_REGEX.test('tv_paga')).toBe(true);
    expect(SLUG_REGEX.test('1tv')).toBe(false);
  });
});

describe('validateTipoDraft — linhas (RN-05)', () => {
  it('descarta linhas vazias e acusa cada erro com o número da linha', () => {
    const rows: ParamRow[] = [
      row({ key: 'a', nome: '', label: '' }),
      row({ key: 'b', nome: 'x', label: '' }),
      row({ key: 'c', nome: 'Nome Ruim' }),
      row({ key: 'd', nome: 'dup' }),
      row({ key: 'e', nome: 'dup' }),
      row({ key: 'f', nome: 'sel', tipo: 'select', origem: 'fixas', opcoes: ' | ' }),
      row({ key: 'g', nome: 'api', tipo: 'select', origem: 'api', fonte: '' }),
      row({ key: 'h', nome: 'ok', tipo: 'select', origem: 'api', fonte: 'moleculas' }),
    ];
    const validation = validateTipoDraft(draftValido({ rows }), NOVO);
    expect(validation.rows).toEqual({
      b: '⚠️ Campo 2: informe o nome e o label.',
      c: '⚠️ Campo 3: nome inválido — use letras minúsculas, números e underscore.',
      e: '⚠️ Campo 5: nome repetido.',
      f: '⚠️ Campo 6: informe as opções separadas por |.',
      g: '⚠️ Campo 7: selecione a fonte de dados.',
    });
    expect(primeiraMensagem({ fields: {}, rows: validation.rows })).toBe(
      '⚠️ Campo 2: informe o nome e o label.',
    );
  });

  it('linha original com nome fora do regex é aceita', () => {
    const [original] = camposFixture('tv').campos;
    const legado = row({ nome: 'Canal-Legado', original: original! });
    expect(validateTipoDraft(draftValido({ rows: [legado] }), NOVO).rows).toEqual({});
  });
});

describe('rowsToCampos / camposToRows (RN-07)', () => {
  it('gera id d_{nome} e opções da linha exemplo', () => {
    const campos = rowsToCampos([
      { ...EXEMPLO_ROW, nome: 'tipo_epi', label: 'Tipo epidemiológico' },
      row({ key: 'vazia', nome: '', label: '' }),
    ]);
    expect(campos).toEqual([
      {
        label: 'Tipo epidemiológico',
        required: true,
        id: 'd_tipo_epi',
        param: 'tipo_epi',
        type: 'select',
        options: ['Epidemia', 'Alta sazonal', 'Pandemia'],
      },
    ]);
  });

  it('preserva opções agrupadas quando o texto não muda', () => {
    const agrupado = camposFixture('macro').campos.filter((campo) =>
      campo.options?.some((opcao) => typeof opcao !== 'string'),
    );
    const [linha] = camposToRows(agrupado);
    const [campo] = rowsToCampos([linha!]);
    expect(campo?.options).toBe(agrupado[0]?.options);
    expect(linha?.opcoes.startsWith('Pandemia / Emergência sanitária global|')).toBe(true);
    const [editado] = rowsToCampos([{ ...linha!, opcoes: 'A|B' }]);
    expect(editado?.options).toEqual(['A', 'B']);
    expect(editado?.id).toBe('d_tipo_macro');
  });

  it('origem API grava fonte sem options; tipo não-select limpa os dois', () => {
    const [linha] = camposToRows(camposFixture('tv').campos.filter((c) => c.type === 'select'));
    const [api] = rowsToCampos([{ ...linha!, origem: 'api', fonte: 'moleculas' }]);
    expect(api).toMatchObject({ type: 'select', fonte: 'moleculas' });
    expect(api).not.toHaveProperty('options');
    const [texto] = rowsToCampos([{ ...linha!, tipo: 'text', fonte: 'moleculas' }]);
    expect(texto).not.toHaveProperty('options');
    expect(texto).not.toHaveProperty('fonte');
    expect(camposToRows([api!])[0]).toMatchObject({
      origem: 'api',
      fonte: 'moleculas',
      opcoes: '',
    });
  });

  it('preserva atributos do original (placeholder, step, readonly, autocomplete)', () => {
    const [linha] = camposToRows(camposFixture('tv').campos);
    const [campo] = rowsToCampos([{ ...linha!, label: 'Canal', obrigatorio: true }]);
    expect(campo).toMatchObject({
      label: 'Canal',
      required: true,
      placeholder: 'Ex: Globo, Record, SBT',
    });
  });

  it('ida e volta é idempotente para os 47 camposTipo do db.json', () => {
    expect(CAMPOS_TIPO).toHaveLength(47);
    CAMPOS_TIPO.forEach((campos) => {
      expect(rowsToCampos(camposToRows(campos.campos))).toEqual(campos.campos);
    });
  });
});

describe('categoriaPatches (RN-08)', () => {
  const categorias = categoriasFixture();

  it('criar acrescenta o slug na categoria nova', () => {
    const patches = categoriaPatches(categorias, {
      slug: 'novo',
      label: 'Novo',
      catAnterior: null,
      catNova: 'sazo',
    });
    expect(patches).toHaveLength(1);
    expect(patches[0]?.id).toBe(7);
    expect(patches[0]?.tipos.at(-1)).toEqual({ slug: 'novo', label: 'Novo' });
  });

  it('mudança de categoria gera dois patches', () => {
    const patches = categoriaPatches(categorias, {
      slug: 'tv',
      label: '📺 TV Aberta',
      catAnterior: 'midia',
      catNova: 'comercial',
    });
    expect(patches.map((patch) => patch.id)).toEqual([0, 1]);
    expect(patches[0]?.tipos.some((tipo) => tipo.slug === 'tv')).toBe(false);
    expect(patches[1]?.tipos.at(-1)).toEqual({ slug: 'tv', label: '📺 TV Aberta' });
  });

  it('só o label gera um patch mantendo a posição', () => {
    const patches = categoriaPatches(categorias, {
      slug: 'tv_paga',
      label: 'TV Paga',
      catAnterior: 'midia',
      catNova: 'midia',
    });
    expect(patches).toHaveLength(1);
    expect(patches[0]?.tipos[1]).toEqual({ slug: 'tv_paga', label: 'TV Paga' });
  });

  it('sem mudança não gera patch; remover tira o slug', () => {
    expect(
      categoriaPatches(categorias, { slug: 'tv', label: '📺 TV Aberta', catNova: 'midia' }),
    ).toEqual([]);
    const patches = categoriaPatches(categorias, {
      slug: 'tv',
      label: '',
      catNova: null,
      remover: true,
    });
    expect(patches).toHaveLength(1);
    expect(patches[0]?.tipos.some((tipo) => tipo.slug === 'tv')).toBe(false);
  });

  it('aplicarCategoriaPatches atualiza só as categorias alteradas', () => {
    const patches = [{ id: 0, tipos: [] }];
    const atualizadas = aplicarCategoriaPatches(categorias, patches);
    expect(atualizadas[0]?.tipos).toEqual([]);
    expect(atualizadas[1]).toBe(categorias[1]);
  });
});
