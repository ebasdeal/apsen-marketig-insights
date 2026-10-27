import { makeFamilia } from '@test/factories/catalogo';
import {
  CAMPOS_PRECO,
  CATEGORIAS,
  CONFIG,
  INTENSIDADES,
  makeCamposTipo,
  makeDraft,
  makeDriver,
  makeSku,
} from '@test/factories/drivers';
import {
  definirIntensidade,
  definirParametro,
  draftDeDriver,
  draftInicial,
  editarUplift,
  escolherSugestao,
  isDraftSujo,
  limpar,
  ordenarChips,
  trocarCategoria,
  trocarModo,
  trocarTipo,
} from '../draft';

const CTX = { intensidades: INTENSIDADES, canaisDefault: CONFIG.canaisDefault };

describe('draftInicial', () => {
  it('modo SKU, intensidade 1 com uplift sugerido e canal Farmácias', () => {
    const draft = draftInicial(CTX);
    expect(draft).toMatchObject({
      modo: 'sku',
      sku: null,
      intensidade: 1,
      uplift: '2',
      upliftManual: false,
      canais: ['farmacias'],
      regioes: [],
      categoriaId: null,
      tipo: '',
    });
  });

  it('com família (RN-16) abre no modo Família', () => {
    expect(draftInicial({ ...CTX, familia: 'LEVOXIN' })).toMatchObject({
      modo: 'familia',
      familia: 'LEVOXIN',
    });
    expect(draftInicial({ ...CTX, modo: 'franquia' }).modo).toBe('franquia');
  });
});

describe('trocarModo (RN-01, CA-03)', () => {
  it('limpa os produtos dos modos inativos e mantém o resto', () => {
    const comSku = makeDraft({ franquia: 'ASTER', familia: 'LEVOXIN' });
    const familia = trocarModo(comSku, 'familia');
    expect(familia).toMatchObject({ modo: 'familia', sku: null, franquia: '', familia: 'LEVOXIN' });
    expect(familia.titulo).toBe(comSku.titulo);
    const deVolta = trocarModo(familia, 'sku');
    expect(deVolta).toMatchObject({ modo: 'sku', sku: null, familia: '', franquia: '' });
    expect(trocarModo(comSku, 'franquia')).toMatchObject({ franquia: 'ASTER', familia: '' });
  });
});

describe('trocarCategoria / trocarTipo (CA-05, CA-07, RN-09)', () => {
  it('trocar a categoria limpa tipo, parâmetros e herdado', () => {
    expect(trocarCategoria(makeDraft(), 1)).toMatchObject({
      categoriaId: 1,
      tipo: '',
      parametros: {},
      herdado: null,
    });
  });

  it('concorrente herda a família do SKU na molécula', () => {
    const draft = trocarTipo(makeDraft({ tipo: '', parametros: {} }), 'concorrente', [
      ...makeCamposTipo().campos,
    ]);
    expect(draft.parametros).toMatchObject({ mol_conc: 'LEVOXIN', tipo_conc: 'Genérico' });
    expect(draft.herdado).toBe('LEVOXIN');
  });

  it('modo Família herda a família escolhida; Franquia não herda', () => {
    const campos = makeCamposTipo().campos;
    const familia = makeDraft({ modo: 'familia', sku: null, familia: 'RETEMIC' });
    expect(trocarTipo(familia, 'concorrente', campos).parametros.mol_conc).toBe('RETEMIC');
    const franquia = makeDraft({ modo: 'franquia', sku: null, franquia: 'ASTER' });
    const semHeranca = trocarTipo(franquia, 'concorrente', campos);
    expect(semHeranca.parametros.mol_conc).toBe('');
    expect(semHeranca.herdado).toBeNull();
  });

  it('tipo sem herança zera herdado e usa os valores iniciais', () => {
    const draft = trocarTipo(makeDraft(), 'preco', CAMPOS_PRECO.campos);
    expect(draft.herdado).toBeNull();
    expect(draft.parametros).toEqual({
      tipo_preco: 'Reajuste preço fábrica',
      preco_ant: '',
      preco_novo: '',
      var_preco: '',
    });
    expect(trocarTipo(makeDraft(), 'tv').parametros).toEqual({});
  });

  it('herança exige o campo de molécula no tipo', () => {
    const campos = makeCamposTipo().campos.filter((campo) => campo.param !== 'mol_conc');
    expect(trocarTipo(makeDraft(), 'concorrente', campos).herdado).toBeNull();
  });
});

describe('definirParametro / escolherSugestao (RN-10, RN-11)', () => {
  it('recalcula a variação a cada mudança de preço', () => {
    const preco = trocarTipo(makeDraft(), 'preco', CAMPOS_PRECO.campos);
    const comAnterior = definirParametro(preco, 'preco_ant', '40');
    expect(comAnterior.parametros.var_preco).toBe('');
    const comNovo = definirParametro(comAnterior, 'preco_novo', '42.6');
    expect(comNovo.parametros.var_preco).toBe('6.50');
    expect(definirParametro(comNovo, 'preco_ant', '0').parametros.var_preco).toBe('');
    expect(definirParametro(comNovo, 'tipo_preco', 'X').parametros.var_preco).toBe('6.50');
  });

  it('escolher o laboratório limpa a marca', () => {
    const draft = makeDraft({ parametros: { lab_conc: '', conc_nome: 'Germed' } });
    expect(escolherSugestao(draft, 'lab_conc', 'EMS').parametros).toEqual({
      lab_conc: 'EMS',
      conc_nome: '',
    });
    expect(escolherSugestao(draft, 'conc_nome', 'Legrand').parametros.conc_nome).toBe('Legrand');
  });
});

describe('intensidade e uplift (RN-12, CA-09)', () => {
  it('mover o slider reescreve o uplift sugerido; digitar marca manual', () => {
    const manual = editarUplift(makeDraft(), '7');
    expect(manual).toMatchObject({ uplift: '7', upliftManual: true });
    expect(definirIntensidade(manual, 4, INTENSIDADES)).toMatchObject({
      intensidade: 4,
      uplift: '22',
      upliftManual: false,
    });
  });

  it('ordenarChips segue a ordem das opções e mantém valores desconhecidos no fim', () => {
    expect(ordenarChips(['sul', 'antigo', 'nacional'], CONFIG.regioes)).toEqual([
      'nacional',
      'sul',
      'antigo',
    ]);
  });
});

describe('limpar (RN-13, CA-11)', () => {
  it('volta ao estado inicial mantendo a granularidade', () => {
    const preenchido = makeDraft({
      modo: 'familia',
      familia: 'LEVOXIN',
      intensidade: 4,
      uplift: '30',
      upliftManual: true,
      verba: '1000',
      regioes: ['sul'],
      canais: [],
    });
    expect(limpar(preenchido, CTX)).toEqual(draftInicial({ ...CTX, modo: 'familia' }));
    expect(limpar(preenchido, CTX)).toMatchObject({
      familia: '',
      intensidade: 1,
      uplift: '2',
      canais: ['farmacias'],
    });
  });
});

describe('draftDeDriver (RN-14, CA-13)', () => {
  const ctx = {
    sku: makeSku(),
    familia: null,
    categorias: CATEGORIAS,
    camposPorTipo: { preco: CAMPOS_PRECO },
    intensidades: INTENSIDADES,
  };

  it('pré-preenche SKU, categoria pelo tipo, parâmetros e uplift salvo como manual', () => {
    const draft = draftDeDriver(makeDriver(), ctx);
    expect(draft).toMatchObject({
      modo: 'sku',
      sku: makeSku(),
      categoriaId: 1,
      tipo: 'preco',
      inicio: '2026-07-15',
      fim: '2027-01-15',
      intensidade: 3,
      uplift: '11',
      upliftManual: true,
      verba: '',
      regioes: ['sudeste', 'sul'],
    });
    expect(draft.parametros).toEqual({
      tipo_preco: 'Reajuste preço fábrica',
      preco_ant: '',
      preco_novo: '42.90',
      var_preco: '',
      variacao_pct: '6.5',
    });
  });

  it('categoria 0 (Mídia) é carregada e chaves antigas ficam', () => {
    const tv = makeDriver({
      tipo: 'tv',
      upliftPct: null,
      verbaRs: 1800000,
      intensidadeEsperada: 5,
      parametros: { emissora: 'Globo' },
    });
    const draft = draftDeDriver(tv, ctx);
    expect(draft).toMatchObject({
      categoriaId: 0,
      uplift: '40',
      upliftManual: false,
      verba: '1800000',
      parametros: { emissora: 'Globo' },
    });
  });

  it('modo Família e Franquia', () => {
    const familia = draftDeDriver(makeDriver({ modo: 'familia', molecula: 'LEVOXIN' }), {
      ...ctx,
      sku: null,
      familia: makeFamilia(),
    });
    expect(familia).toMatchObject({ modo: 'familia', familia: 'LEVOXIN', sku: null });
    const semFamilia = draftDeDriver(makeDriver({ modo: 'familia' }), { ...ctx, familia: null });
    expect(semFamilia.familia).toBe('');
    const franquia = draftDeDriver(makeDriver({ modo: 'franquia', molecula: 'ASTER' }), ctx);
    expect(franquia).toMatchObject({ franquia: 'ASTER', sku: null, familia: '' });
    expect(draftDeDriver(makeDriver({ tipo: 'xyz' }), ctx).categoriaId).toBeNull();
  });
});

describe('isDraftSujo (RN-17)', () => {
  it('compara estruturalmente', () => {
    const inicial = draftInicial(CTX);
    expect(isDraftSujo(draftInicial(CTX), inicial)).toBe(false);
    expect(isDraftSujo({ ...inicial, titulo: 'x' }, inicial)).toBe(true);
    expect(isDraftSujo({ ...inicial, canais: [] }, inicial)).toBe(true);
    expect(isDraftSujo({ ...inicial, sku: makeSku() }, inicial)).toBe(true);
    expect(isDraftSujo({ ...inicial, parametros: { a: '1' } }, inicial)).toBe(true);
    expect(
      isDraftSujo({ ...inicial, regioes: {} as unknown as string[] }, { ...inicial, regioes: [] }),
    ).toBe(true);
  });
});
