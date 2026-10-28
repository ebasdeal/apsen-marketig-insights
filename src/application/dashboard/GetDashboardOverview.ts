import {
  STATUS_PLANO_DASHBOARD,
  type DashboardOverview,
  type DashboardRepository,
} from '@domain/dashboard/DashboardOverview';
import {
  barras,
  percentual,
  produtoCurto,
  restantesPendentes,
} from '@domain/dashboard/dashboardRules';
import type { DashboardOverviewOutput } from './dto';

export function toDashboardOutput(overview: DashboardOverview): DashboardOverviewOutput {
  const { plano, aguardandoAprovacao } = overview;
  return {
    ciclo: overview.cicloAtivo?.id ?? null,
    atualizadoEm: overview.atualizadoEm,
    pipeline: { ...overview.pipeline },
    restricoes: { ativas: overview.restricoes.ativas, criticas: overview.restricoes.criticas },
    plano: {
      total: plano.total,
      aprovados: plano.aprovados,
      status: STATUS_PLANO_DASHBOARD.map(({ status, label }) => ({
        status,
        label,
        n: plano.porStatus[status],
        pct: percentual(plano.porStatus[status], plano.total),
      })),
    },
    analises: { ...overview.analises },
    categorias: barras(overview.driversPorCategoria),
    restricoesPorTipo: barras(overview.restricoes.porTipo, true),
    pendentes: {
      itens: aguardandoAprovacao.itens.map((item) => ({
        id: item.id,
        produto: produtoCurto(item.produto),
        tipo: item.tipo,
      })),
      restantes: restantesPendentes(aguardandoAprovacao.total, aguardandoAprovacao.itens.length),
    },
  };
}

export class GetDashboardOverview {
  constructor(private readonly repository: DashboardRepository) {}

  async execute(): Promise<DashboardOverviewOutput> {
    return toDashboardOutput(await this.repository.overview());
  }
}
