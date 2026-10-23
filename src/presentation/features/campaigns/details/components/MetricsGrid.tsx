import type { CampaignDetailsOutput } from '@application/campaigns/dto';
import { Section } from '@presentation/components/ui';
import { formatCurrency, formatInteger, formatPercent } from '@presentation/format/formatters';

interface MetricsGridProps {
  campaign: CampaignDetailsOutput;
}

interface MetricItem {
  label: string;
  value: string;
}

function toMetricItems({ kpis, metrics }: CampaignDetailsOutput): MetricItem[] {
  return [
    { label: 'Impressões', value: formatInteger(metrics.impressions) },
    { label: 'Cliques', value: formatInteger(metrics.clicks) },
    { label: 'Conversões', value: formatInteger(metrics.conversions) },
    { label: 'Taxa de conversão', value: formatPercent(kpis.conversionRate) },
    { label: 'CPC', value: formatCurrency(kpis.cpc) },
  ];
}

export function MetricsGrid({ campaign }: MetricsGridProps) {
  return (
    <Section title="📊 Métricas da campanha" variant="detail">
      <dl className="grid grid-cols-4 gap-[16px] max-[800px]:grid-cols-2">
        {toMetricItems(campaign).map((item) => (
          <div key={item.label}>
            <dt className="mb-[3px] text-[10.5px] font-bold uppercase tracking-[.06em] text-apsen-muted">
              {item.label}
            </dt>
            <dd className="text-[13px] font-medium leading-[1.5] text-apsen-slate">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
