import type { CategoriaSlug, ParamOrigem, ParamRow, ParamTipo, TipoDraft } from './Tipo';

export interface Opcao<T extends string = string> {
  value: T;
  label: string;
}

export type CodeTone =
  'slate' | 'muted' | 'blue' | 'red' | 'purple' | 'orange' | 'green' | 'teal' | 'yellow';

export type TipoCatFiltro = CategoriaSlug | 'all';

export const TIPO_CAT_FILTERS: readonly Opcao<TipoCatFiltro>[] = [
  { value: 'all', label: 'Todos' },
  { value: 'midia', label: '📡 Mídia' },
  { value: 'comercial', label: '🛒 Comercial' },
  { value: 'produto', label: '💊 Produto' },
  { value: 'supply', label: '⚙️ Supply' },
  { value: 'logistica', label: '🚚 Logística' },
  { value: 'concorrencia', label: '🏁 Concorrência' },
  { value: 'regulatorio', label: '📋 Regulatório' },
  { value: 'sazo', label: '🌡️ Sazonalidade' },
  { value: 'social', label: '📣 Social' },
  { value: 'macro', label: '🌍 Macro' },
];

export const DONOS_AREA: readonly string[] = [
  'Marketing',
  'Comercial & Trade',
  'Força de Vendas',
  'Supply & PCP',
  'Regulatório',
  'Inteligência Competitiva',
  'S&OP / Planejamento',
  'Financeiro',
];

export const FEATURE_TIPOS: readonly Opcao[] = [
  { value: 'dummy', label: 'Indicador simples (0/1) — evento pontual com início e fim' },
  { value: 'continua', label: 'Variável numérica — ex: GRP, impressões, nº PDVs' },
  {
    value: 'dummy_lag',
    label: 'Indicador defasado — efeito aparece antes ou depois do evento',
  },
  {
    value: 'dummy_decaimento',
    label: 'Indicador com decaimento — efeito reduz progressivamente após o evento',
  },
  { value: 'fourier_sazo', label: 'Padrão sazonal recorrente (Fourier) — ex: gripe todo inverno' },
  {
    value: 'dummy_censored',
    label: 'Demanda censurada — ruptura ou recall mascarou a demanda real',
  },
  {
    value: 'dummy_permanente',
    label: 'Indicador permanente — mudança estrutural que não reverte',
  },
];

export const IMPACTO_SERIE: readonly Opcao[] = [
  { value: 'aumento', label: '↑ Aumento de demanda' },
  { value: 'reducao', label: '↓ Redução / censura de demanda' },
  { value: 'ambos', label: '↕ Pode ser ambos (depende do evento)' },
  { value: 'neutro', label: '→ Neutro / marcação temporal' },
];

export const PERMANENCIA: readonly Opcao[] = [
  { value: 'temporario', label: 'Temporário — até fim do evento' },
  { value: 'residual', label: 'Residual — decai após o evento' },
  { value: 'permanente', label: 'Permanente / estrutural' },
];

export const PARAM_TIPOS: readonly ParamTipo[] = ['select', 'text', 'number', 'date'];

export const PARAM_ORIGENS: readonly Opcao<ParamOrigem>[] = [
  { value: 'fixas', label: 'Opções fixas' },
  { value: 'api', label: 'Fonte de dados (API)' },
];

export const FEATURE_TONES: Readonly<Record<string, CodeTone>> = {
  dummy: 'blue',
  dummy_lag: 'blue',
  'dummy_lag+1': 'blue',
  'dummy_lag+2': 'blue',
  dummy_censored: 'red',
  dummy_permanente: 'purple',
  dummy_decaimento: 'orange',
  fourier_sazo: 'green',
  continua_grp: 'teal',
  continua_impressoes: 'teal',
  continua_pdvs: 'teal',
  continua_elast: 'teal',
  dummy_gap: 'yellow',
  dummy_push: 'yellow',
  dummy_digestao: 'yellow',
};

export const EXEMPLO_ROW: ParamRow = {
  key: 'row-1',
  nome: '',
  label: '',
  tipo: 'select',
  obrigatorio: true,
  origem: 'fixas',
  opcoes: 'Epidemia|Alta sazonal|Pandemia',
  fonte: '',
};

export const NOVA_ROW: Omit<ParamRow, 'key'> = {
  nome: '',
  label: '',
  tipo: 'text',
  obrigatorio: false,
  origem: 'fixas',
  opcoes: '',
  fonte: '',
};

export const LAG_MIN = -3;

export const LAG_MAX = 6;

export function draftNovo(): TipoDraft {
  return {
    slug: '',
    label: '',
    cat: '',
    dono: '',
    desc: '',
    feature: 'dummy',
    lag: '0',
    impacto: 'aumento',
    perm: 'temporario',
    nota: '',
    ativo: true,
    rows: [{ ...EXEMPLO_ROW }],
  };
}
