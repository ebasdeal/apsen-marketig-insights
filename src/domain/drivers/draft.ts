import type { Familia, Sku } from '../catalogo/Produto';
import { categoriaDoTipo } from './badgeTone';
import {
  PARAM_LABORATORIO,
  PARAM_MARCA,
  PARAM_MOLECULA_HERDADA,
  PARAMS_PRECO,
  moleculaHerdada,
  valoresIniciais,
} from './camposDinamicos';
import { INTENSIDADE_INICIAL, type Driver, type Granularidade, type Intensidade } from './Driver';
import { upliftSugerido } from './intensidade';
import type { CampoTipo, CamposTipo, Categoria, ChipOpcao, IntensidadeInfo } from './lookups';
import { variacaoPreco } from './variacaoPreco';

export type DraftCampo =
  'sku' | 'familia' | 'franquia' | 'categoria' | 'tipo' | 'inicio' | 'fim' | `param:${string}`;

export interface DriverDraft {
  modo: Granularidade;
  franquia: string;
  familia: string;
  sku: Sku | null;
  titulo: string;
  inicio: string;
  fim: string;
  categoriaId: number | null;
  tipo: string;
  parametros: Record<string, string>;
  herdado: string | null;
  regioes: string[];
  canais: string[];
  intensidade: Intensidade;
  uplift: string;
  upliftManual: boolean;
  verba: string;
  observacoes: string;
}

export interface DraftContexto {
  intensidades: readonly IntensidadeInfo[];
  canaisDefault: readonly string[];
  modo?: Granularidade;
  familia?: string;
}

export interface DraftDeDriverContexto {
  sku: Sku | null;
  familia: Familia | null;
  categorias: readonly Categoria[];
  camposPorTipo: Readonly<Record<string, CamposTipo>>;
  intensidades: readonly IntensidadeInfo[];
}

export function draftInicial(ctx: DraftContexto): DriverDraft {
  const familia = ctx.familia ?? '';
  return {
    modo: ctx.modo ?? (familia === '' ? 'sku' : 'familia'),
    franquia: '',
    familia,
    sku: null,
    titulo: '',
    inicio: '',
    fim: '',
    categoriaId: null,
    tipo: '',
    parametros: {},
    herdado: null,
    regioes: [],
    canais: [...ctx.canaisDefault],
    intensidade: INTENSIDADE_INICIAL,
    uplift: upliftSugerido(INTENSIDADE_INICIAL, ctx.intensidades),
    upliftManual: false,
    verba: '',
    observacoes: '',
  };
}

export function trocarModo(draft: DriverDraft, modo: Granularidade): DriverDraft {
  return {
    ...draft,
    modo,
    franquia: modo === 'franquia' ? draft.franquia : '',
    familia: modo === 'familia' ? draft.familia : '',
    sku: modo === 'sku' ? draft.sku : null,
  };
}

export function trocarCategoria(draft: DriverDraft, categoriaId: number | null): DriverDraft {
  return { ...draft, categoriaId, tipo: '', parametros: {}, herdado: null };
}

export function trocarTipo(
  draft: DriverDraft,
  tipo: string,
  campos: readonly CampoTipo[] = [],
): DriverDraft {
  const parametros = valoresIniciais(campos);
  const param = PARAM_MOLECULA_HERDADA[tipo];
  const molecula = moleculaHerdada(draft);
  const herda = param !== undefined && param in parametros && molecula !== null;
  if (herda && parametros[param] === '') {
    parametros[param] = molecula;
    return { ...draft, tipo, parametros, herdado: molecula };
  }
  return { ...draft, tipo, parametros, herdado: null };
}

export function definirParametro(draft: DriverDraft, param: string, valor: string): DriverDraft {
  const parametros = { ...draft.parametros, [param]: valor };
  if (param === PARAMS_PRECO.anterior || param === PARAMS_PRECO.novo) {
    parametros[PARAMS_PRECO.variacao] =
      variacaoPreco(parametros[PARAMS_PRECO.anterior] ?? '', parametros[PARAMS_PRECO.novo] ?? '') ??
      '';
  }
  return { ...draft, parametros };
}

export function escolherSugestao(draft: DriverDraft, param: string, valor: string): DriverDraft {
  const atualizado = definirParametro(draft, param, valor);
  if (param !== PARAM_LABORATORIO) {
    return atualizado;
  }
  return { ...atualizado, parametros: { ...atualizado.parametros, [PARAM_MARCA]: '' } };
}

export function definirIntensidade(
  draft: DriverDraft,
  intensidade: Intensidade,
  intensidades: readonly IntensidadeInfo[],
): DriverDraft {
  return {
    ...draft,
    intensidade,
    uplift: upliftSugerido(intensidade, intensidades),
    upliftManual: false,
  };
}

export function editarUplift(draft: DriverDraft, uplift: string): DriverDraft {
  return { ...draft, uplift, upliftManual: true };
}

export function ordenarChips(valores: readonly string[], opcoes: readonly ChipOpcao[]): string[] {
  const conhecidas = opcoes.map((opcao) => opcao.value);
  return [
    ...conhecidas.filter((valor) => valores.includes(valor)),
    ...valores.filter((valor) => !conhecidas.includes(valor)),
  ];
}

export function limpar(draft: DriverDraft, ctx: DraftContexto): DriverDraft {
  return draftInicial({
    intensidades: ctx.intensidades,
    canaisDefault: ctx.canaisDefault,
    modo: draft.modo,
  });
}

export function draftDeDriver(driver: Driver, ctx: DraftDeDriverContexto): DriverDraft {
  const campos = ctx.camposPorTipo[driver.tipo]?.campos ?? [];
  const manual = driver.upliftPct !== null;
  return {
    modo: driver.modo,
    franquia: driver.modo === 'franquia' ? driver.molecula : '',
    familia: driver.modo === 'familia' ? (ctx.familia?.id ?? '') : '',
    sku: driver.modo === 'sku' ? ctx.sku : null,
    titulo: driver.titulo,
    inicio: driver.periodo.inicio,
    fim: driver.periodo.fim,
    categoriaId: categoriaDoTipo(driver.tipo, ctx.categorias)?.id ?? null,
    tipo: driver.tipo,
    parametros: { ...valoresIniciais(campos), ...driver.parametros },
    herdado: null,
    regioes: [...driver.cobertura.regioes],
    canais: [...driver.cobertura.canais],
    intensidade: driver.intensidadeEsperada,
    uplift: manual
      ? String(driver.upliftPct)
      : upliftSugerido(driver.intensidadeEsperada, ctx.intensidades),
    upliftManual: manual,
    verba: driver.verbaRs === null ? '' : String(driver.verbaRs),
    observacoes: driver.observacoes,
  };
}

function iguais(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  const chavesA = Object.keys(a);
  const chavesB = Object.keys(b);
  return (
    chavesA.length === chavesB.length &&
    chavesA.every((chave) =>
      iguais((a as Record<string, unknown>)[chave], (b as Record<string, unknown>)[chave]),
    )
  );
}

export function isDraftSujo(draft: DriverDraft, inicial: DriverDraft): boolean {
  return !iguais(draft, inicial);
}
