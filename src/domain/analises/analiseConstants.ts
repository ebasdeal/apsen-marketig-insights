import type { AnaliseStatus } from './Analise';

export const ANALISE_STATUS_LABEL: Record<AnaliseStatus, string> = {
  rascunho: '📝 Rascunho',
  salva: '✅ Salva',
  relatorio: '📄 Relatório',
};

export const ANALISE_STATUS_FILTRO: readonly { value: AnaliseStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'rascunho', label: '📝 Rascunho' },
  { value: 'salva', label: '✅ Salva' },
  { value: 'relatorio', label: '📄 Relatório emitido' },
];

export const ANALISE_TIPOS = [
  'Impacto de drivers em SKUs específicos',
  'Forecast / previsão de demanda',
  'Comparativo ciclo a ciclo',
  'Análise de demanda censurada',
  'Marketing Mix Modeling (MMM)',
  'Análise ad hoc',
] as const;

export const TIPO_ANALISE_PADRAO = 'Análise ad hoc';

export const MODELOS_AVANCADOS: readonly { value: string; label: string }[] = [
  { value: 'sarimax', label: 'SARIMAX' },
  { value: 'prophet', label: 'Prophet (Meta)' },
  { value: 'regressao_causal', label: 'Regressão Causal' },
  { value: 'holt_winters', label: 'Holt-Winters' },
  { value: 'media_movel', label: 'Média Móvel' },
  { value: 'ensemble', label: 'Ensemble' },
];

export const MODELO_GUIADO_PADRAO = 'sarimax';

export const PARAMS_SARIMAX = ['p', 'd', 'q', 'P', 'D', 'Q', 's'] as const;

export const PARAM_SARIMAX_PADRAO = 1;

export const SAZONALIDADES_PROPHET = ['Anual', 'Semanal', 'Mensal', 'Feriados BR'] as const;

export const MODELOS_ENSEMBLE = ['SARIMAX', 'Prophet', 'Reg. Causal'] as const;

export const HORIZONTE_PADRAO = 3;

export const HORIZONTE_MIN = 1;

export const HORIZONTE_MAX = 24;

export const PDF_SECOES: readonly { id: string; label: string; marcada: boolean }[] = [
  { id: 'sumario', label: 'Sumário executivo', marcada: true },
  { id: 'impacto', label: 'Impacto por driver', marcada: true },
  { id: 'justificativas', label: 'Justificativas', marcada: true },
  { id: 'modelo', label: 'Modelo utilizado', marcada: true },
  { id: 'interacoes', label: 'Interações com IA', marcada: false },
];

export const ANALISES_POR_PAGINA = 10;

export const DRIVERS_SUGERIDOS_LIMITE = 50;

export const MESES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const;

export const CRESCIMENTO = [0, 0.03, 0.06, 0.09, 0.13, 0.17, 0.21, 0.25, 0.22, 0.19, 0.15, 0.1];

export const IMPACTO_PADRAO = 14;

export const ESPERA_EXECUCAO_MS = 2000;

export const ESPERA_CHAT_MS = 1400;
