import type { CampaignDetailsOutput } from '@application/campaigns/dto';
import { KpiCard, type KpiTone } from '@presentation/components/ui';
import { formatCurrency, formatPercent, formatRoas } from '@presentation/format/formatters';

interface CampaignKpiGridProps {
  campaign: CampaignDetailsOutput;
}

interface KpiItem {
  label: string;
  value: string;
  icon: string;
  tone: KpiTone;
}

function toKpiItems({ kpis, revenue }: CampaignDetailsOutput): KpiItem[] {
  return [
    { label: 'ROAS', value: formatRoas(kpis.roas), icon: '🎯', tone: 'orange' },
    { label: 'Receita', value: formatCurrency(revenue), icon: '📈', tone: 'green' },
    { label: 'CPA', value: formatCurrency(kpis.cpa), icon: '🧾', tone: 'blue' },
    { label: 'CTR', value: formatPercent(kpis.ctr), icon: '👆', tone: 'blue' },
  ];
}

export function CampaignKpiGrid({ campaign }: CampaignKpiGridProps) {
  return (
    <div className="kpi-grid">
      {toKpiItems(campaign).map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  );
}
