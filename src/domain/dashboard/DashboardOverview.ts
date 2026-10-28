export type PlanoStatusDashboard = 'aprovado' | 'revisao' | 'bloqueado' | 'pendente';

export interface ContagemRotulada {
  chave: string;
  label: string;
  n: number;
}

export interface PendenteDashboard {
  id: string;
  produto: string;
  tipo: string;
}

export interface DashboardOverview {
  atualizadoEm: string;
  cicloAtivo: { id: string; descricao: string } | null;
  pipeline: { total: number; pendentes: number };
  restricoes: { ativas: number; criticas: number; porTipo: ContagemRotulada[] };
  plano: { total: number; aprovados: number; porStatus: Record<PlanoStatusDashboard, number> };
  analises: { total: number; salvas: number };
  driversPorCategoria: ContagemRotulada[];
  aguardandoAprovacao: { total: number; itens: PendenteDashboard[] };
}

export interface DashboardRepository {
  overview(): Promise<DashboardOverview>;
}

export const STATUS_PLANO_DASHBOARD: readonly { status: PlanoStatusDashboard; label: string }[] = [
  { status: 'aprovado', label: 'Aprovado' },
  { status: 'revisao', label: 'Em Revisão' },
  { status: 'bloqueado', label: 'Bloqueado' },
  { status: 'pendente', label: 'Pendente' },
];
