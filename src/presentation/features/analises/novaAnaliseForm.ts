import type { ConfigModelo, ModoModelo, NovaAnaliseForm } from '@domain/analises/Analise';
import {
  ANALISE_TIPOS,
  HORIZONTE_PADRAO,
  MODELO_GUIADO_PADRAO,
  MODELOS_ENSEMBLE,
  PARAM_SARIMAX_PADRAO,
  PARAMS_SARIMAX,
  SAZONALIDADES_PROPHET,
} from '@domain/analises/analiseConstants';
import type { CampoAnalise } from '@domain/analises/AnaliseInvalidaError';

export interface NovaAnaliseState {
  titulo: string;
  ciclo: string;
  tipo: string;
  comentarios: string;
  skus: string[];
  driversDesmarcados: string[];
  modo: ModoModelo;
  modeloGuiado: string;
  modeloAvancado: string;
  horizonte: string;
  sarimax: Record<string, string>;
  sazonalidades: Record<string, boolean>;
  ensemble: Record<string, boolean>;
  dirty: boolean;
}

export type NovaAnaliseCampo =
  'titulo' | 'tipo' | 'comentarios' | 'modeloGuiado' | 'modeloAvancado' | 'horizonte';

export type NovaAnaliseAction =
  | { type: 'campo'; campo: NovaAnaliseCampo; valor: string }
  | { type: 'ciclo'; valor: string }
  | { type: 'modo'; valor: ModoModelo }
  | { type: 'sku'; codigo: string; marcado: boolean }
  | { type: 'skus'; codigos: string[] }
  | { type: 'driver'; id: string; marcado: boolean }
  | { type: 'sarimax'; param: string; valor: string }
  | { type: 'sazonalidade'; nome: string; marcado: boolean }
  | { type: 'ensemble'; nome: string; marcado: boolean };

export type ErrosNovaAnalise = Partial<Record<CampoAnalise, string>>;

function todos<T extends string>(nomes: readonly T[], valor: boolean): Record<string, boolean> {
  return Object.fromEntries(nomes.map((nome) => [nome, valor]));
}

export const ESTADO_INICIAL: NovaAnaliseState = {
  titulo: '',
  ciclo: '',
  tipo: ANALISE_TIPOS[0],
  comentarios: '',
  skus: [],
  driversDesmarcados: [],
  modo: 'auto',
  modeloGuiado: MODELO_GUIADO_PADRAO,
  modeloAvancado: MODELO_GUIADO_PADRAO,
  horizonte: String(HORIZONTE_PADRAO),
  sarimax: Object.fromEntries(PARAMS_SARIMAX.map((param) => [param, String(PARAM_SARIMAX_PADRAO)])),
  sazonalidades: todos(SAZONALIDADES_PROPHET, true),
  ensemble: todos(MODELOS_ENSEMBLE, true),
  dirty: false,
};

function alternar(lista: readonly string[], item: string, incluir: boolean): string[] {
  const sem = lista.filter((atual) => atual !== item);
  return incluir ? [...sem, item] : sem;
}

function aplicar(state: NovaAnaliseState, action: NovaAnaliseAction): NovaAnaliseState {
  switch (action.type) {
    case 'campo':
      return { ...state, [action.campo]: action.valor };
    case 'ciclo':
      return { ...state, ciclo: action.valor, skus: [] };
    case 'modo':
      return { ...state, modo: action.valor };
    case 'sku':
      return { ...state, skus: alternar(state.skus, action.codigo, action.marcado) };
    case 'skus':
      return { ...state, skus: [...action.codigos] };
    case 'driver':
      return {
        ...state,
        driversDesmarcados: alternar(state.driversDesmarcados, action.id, !action.marcado),
      };
    case 'sarimax':
      return { ...state, sarimax: { ...state.sarimax, [action.param]: action.valor } };
    case 'sazonalidade':
      return { ...state, sazonalidades: { ...state.sazonalidades, [action.nome]: action.marcado } };
    case 'ensemble':
      return { ...state, ensemble: { ...state.ensemble, [action.nome]: action.marcado } };
  }
}

export function novaAnaliseReducer(
  state: NovaAnaliseState,
  action: NovaAnaliseAction,
): NovaAnaliseState {
  return { ...aplicar(state, action), dirty: true };
}

function parametrosAvancados(state: NovaAnaliseState): Record<string, number | boolean> | null {
  if (state.modeloAvancado === 'sarimax') {
    return Object.fromEntries(
      Object.entries(state.sarimax).map(([param, valor]) => [param, Number(valor)]),
    );
  }
  if (state.modeloAvancado === 'prophet') return { ...state.sazonalidades };
  if (state.modeloAvancado === 'ensemble') return { ...state.ensemble };
  return null;
}

export function configModeloDe(state: NovaAnaliseState): ConfigModelo {
  if (state.modo === 'auto') return { modo: 'auto' };
  if (state.modo === 'guiado') return { modo: 'guiado', modelo: state.modeloGuiado };
  const parametros = parametrosAvancados(state);
  return {
    modo: 'avancado',
    modelo: state.modeloAvancado,
    ...(parametros === null ? {} : { parametros }),
  };
}

export function formDe(
  state: NovaAnaliseState,
  driversDisponiveis: readonly string[],
): NovaAnaliseForm {
  return {
    titulo: state.titulo,
    ciclo: state.ciclo,
    tipo: state.tipo,
    comentarios: state.comentarios,
    skus: [...state.skus],
    drivers: driversDisponiveis.filter((id) => !state.driversDesmarcados.includes(id)),
    configModelo: configModeloDe(state),
    horizonteTexto: state.horizonte,
  };
}

export function erroDoCampo(mensagem: string): string {
  return mensagem.replace(/^⚠️\s*/, '');
}
