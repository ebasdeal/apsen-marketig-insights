import type { PlanoStatusDashboard } from '@domain/dashboard/DashboardOverview';

export interface BarraOutput {
  chave: string;
  label: string;
  n: number;
  max: number;
}

export interface DashboardOverviewOutput {
  ciclo: string | null;
  atualizadoEm: string;
  pipeline: { total: number; pendentes: number };
  restricoes: { ativas: number; criticas: number };
  plano: {
    total: number;
    aprovados: number;
    status: { status: PlanoStatusDashboard; label: string; n: number; pct: number | null }[];
  };
  analises: { total: number; salvas: number };
  categorias: BarraOutput[];
  restricoesPorTipo: BarraOutput[];
  pendentes: { itens: { id: string; produto: string; tipo: string }[]; restantes: number };
}
