import type { RestricaoTipo, Severidade } from './Restricao';

export interface Opcao<T extends string> {
  value: T;
  label: string;
}

export const RESTRICAO_TIPOS: readonly RestricaoTipo[] = [
  'mp',
  'capacidade',
  'demanda',
  'qualidade',
  'regulatorio',
  'logistica',
  'outro',
];

export const RESTRICAO_LABELS: Record<RestricaoTipo, string> = {
  mp: '🧪 Matéria-Prima',
  capacidade: '⚙️ Capacidade',
  demanda: '📈 Demanda',
  qualidade: '🔬 Qualidade',
  regulatorio: '📋 Regulatório',
  logistica: '🚚 Logística',
  outro: '➕ Outro',
};

export const RESTRICAO_TIPO_OPCOES: readonly Opcao<RestricaoTipo>[] = [
  { value: 'mp', label: '🧪 Matéria-Prima / IFA' },
  { value: 'capacidade', label: '⚙️ Capacidade de Linha' },
  { value: 'demanda', label: '📈 Demanda acima do plano' },
  { value: 'qualidade', label: '🔬 Qualidade / Reprovação de lote' },
  { value: 'regulatorio', label: '📋 Regulatório / Registro' },
  { value: 'logistica', label: '🚚 Logística / Fornecedor' },
  { value: 'outro', label: '➕ Outro' },
];

export const SEVERIDADE_OPCOES: readonly Opcao<Severidade>[] = [
  { value: 'critica', label: '🔴 Crítica — bloqueio total' },
  { value: 'atencao', label: '🟡 Atenção — impacto parcial' },
  { value: 'analise', label: '🔵 Em análise — monitorar' },
];

export const SEVERIDADE_LABEL: Record<Severidade, string> = {
  critica: 'Crítica',
  atencao: 'Atenção',
  analise: 'Em análise',
};

export const RESPONSAVEIS: readonly string[] = [
  'Ana Planejadora',
  'Carlos Lima',
  'Roberto Gerente',
];

export const RESPONSAVEL_PADRAO = 'Ana Planejadora';

export const RESTRICOES_POR_PAGINA = 10;
