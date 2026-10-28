import type { DashboardOverviewOutput } from '@application/dashboard/dto';
import { KpiCard } from '@presentation/components/ui';
import type { Route } from 'next';
import { formatInteger } from '../../../format/formatters';
import { ANALISES_ROUTE } from '../../../navigation/routes';

export function DashboardKpis({ dados }: { dados: DashboardOverviewOutput }) {
  return (
    <div className="kpi-grid">
      <KpiCard
        icon="📥"
        tone="blue"
        hintTone="yellow"
        value={formatInteger(dados.pipeline.total)}
        label="Drivers no pipeline"
        hint={`${dados.pipeline.pendentes} pendentes`}
        href={'/admin/aprovacoes' as Route}
      />
      <KpiCard
        icon="⚠️"
        tone="red"
        value={formatInteger(dados.restricoes.ativas)}
        label="Restrições ativas"
        hint={`${dados.restricoes.criticas} críticas`}
        href={'/restricoes' as Route}
      />
      <KpiCard
        icon="📋"
        tone="green"
        value={formatInteger(dados.plano.total)}
        label={
          dados.ciclo === null
            ? 'Itens no plano (sem ciclo ativo)'
            : `Itens no plano ${dados.ciclo}`
        }
        hint={`${dados.plano.aprovados} aprovados`}
        href={'/planos' as Route}
      />
      <KpiCard
        icon="🔬"
        tone="orange"
        hintTone="green"
        value={formatInteger(dados.analises.total)}
        label="Análises realizadas"
        hint={`${dados.analises.salvas} salvas`}
        href={ANALISES_ROUTE}
      />
    </div>
  );
}
