import { mockConfigOpcoes, readMockDb } from '@test/fixtures/mockDb';
import { CATEGORIAS, TIPOS } from '@test/fixtures/tipos';
import { CATEGORIA_SLUGS, isCategoriaSlug, isParamTipo } from '../Tipo';
import {
  DONOS_AREA,
  draftNovo,
  EXEMPLO_ROW,
  FEATURE_TIPOS,
  FEATURE_TONES,
  IMPACTO_SERIE,
  PARAM_ORIGENS,
  PARAM_TIPOS,
  PERMANENCIA,
  TIPO_CAT_FILTERS,
} from '../vocabulario';

const opcoes = mockConfigOpcoes();

describe('vocabulário de tipos × config.opcoes do db.json', () => {
  it('listas batem com o protótipo', () => {
    expect(TIPO_CAT_FILTERS).toEqual(opcoes.tipoCatFilters);
    expect(DONOS_AREA).toEqual(opcoes.donosArea);
    expect(FEATURE_TIPOS).toEqual(opcoes.featureTipos);
    expect(IMPACTO_SERIE).toEqual(opcoes.impactoSerie);
    expect(PERMANENCIA).toEqual(opcoes.permanencia);
    expect(PARAM_TIPOS).toEqual(opcoes.paramTipos);
    expect(PARAM_ORIGENS).toEqual(opcoes.paramOrigens);
  });

  it('FEATURE_TONES cobre FEATURE_COLORS', () => {
    const cores = readMockDb().config.FEATURE_COLORS as Record<string, string>;
    expect(Object.fromEntries(Object.entries(cores).map(([k, v]) => [k, v.slice(6, -1)]))).toEqual(
      FEATURE_TONES,
    );
  });

  it('categorias e catL da massa usam os slugs e rótulos do vocabulário', () => {
    expect(CATEGORIAS.map((categoria) => categoria.slug)).toEqual([...CATEGORIA_SLUGS]);
    TIPOS.forEach((tipo) => {
      expect(TIPO_CAT_FILTERS.find((filtro) => filtro.value === tipo.cat)?.label).toBe(tipo.catL);
    });
  });

  it('guards e padrões do formulário novo', () => {
    expect(isCategoriaSlug('sazo')).toBe(true);
    expect(isCategoriaSlug('all')).toBe(false);
    expect(isParamTipo('autocomplete')).toBe(true);
    expect(isParamTipo(1)).toBe(false);
    expect(draftNovo()).toMatchObject({
      lag: '0',
      ativo: true,
      feature: 'dummy',
      impacto: 'aumento',
      perm: 'temporario',
      rows: [EXEMPLO_ROW],
    });
    expect(EXEMPLO_ROW).toMatchObject({
      tipo: 'select',
      obrigatorio: true,
      opcoes: 'Epidemia|Alta sazonal|Pandemia',
    });
  });
});
