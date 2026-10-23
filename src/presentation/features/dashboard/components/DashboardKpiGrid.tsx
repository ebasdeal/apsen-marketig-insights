import type { DashboardSummaryOutput } from '@application/dashboard/GetDashboardSummary';
import { KpiCard } from '@presentation/components/ui';
import {
  formatCompact,
  formatCurrency,
  formatInteger,
  formatPercent,
  formatRoas,
} from '@presentation/format/formatters';

interface DashboardKpiGridProps {
  summary: DashboardSummaryOutput;
}

export function DashboardKpiGrid({ summary }: DashboardKpiGridProps) {
  const { totals, kpis } = summary;
  return (
    <div className="kpi-grid">
      <KpiCard
        label="Investimento"
        icon="💰"
        tone="blue"
        value={formatCurrency(totals.spend)}
        hint={`${summary.activeCount} de ${summary.campaignCount} campanhas ativas`}
      />
      <KpiCard label="Receita" icon="📈" tone="green" value={formatCurrency(totals.revenue)} />
      <KpiCard label="ROAS" icon="🎯" tone="orange" value={formatRoas(kpis.roas)} />
      <KpiCard label="CPA" icon="🧾" tone="blue" value={formatCurrency(kpis.cpa)} />
      <KpiCard label="Impressões" icon="👁️" tone="blue" value={formatCompact(totals.impressions)} />
      <KpiCard
        label="Cliques"
        icon="👆"
        tone="orange"
        value={formatInteger(totals.clicks)}
        hint={`CTR ${formatPercent(kpis.ctr)}`}
      />
      <KpiCard label="CPC" icon="💲" tone="blue" value={formatCurrency(kpis.cpc)} />
      <KpiCard
        label="Conversões"
        icon="✅"
        tone="green"
        value={formatInteger(totals.conversions)}
        hint={`Taxa ${formatPercent(kpis.conversionRate)}`}
      />
    </div>
  );
}
