import type { ChannelBreakdownOutput } from '@application/dashboard/GetDashboardSummary';
import { BarRow, CHANNEL_FILL_COLORS, InlineEmpty } from '@presentation/components/ui';
import { formatCurrency } from '@presentation/format/formatters';
import { CHANNEL_LABELS } from '@presentation/format/labels';

interface ChannelBreakdownListProps {
  items: readonly ChannelBreakdownOutput[];
}

function maxSpend(items: readonly ChannelBreakdownOutput[]): number {
  return items.reduce((max, item) => Math.max(max, item.metrics.spend), 0);
}

export function ChannelBreakdownList({ items }: ChannelBreakdownListProps) {
  if (items.length === 0) {
    return <InlineEmpty>Nenhum canal no período.</InlineEmpty>;
  }
  const max = maxSpend(items);
  return (
    <ul aria-label="Canais">
      {items.map((item) => (
        <li key={item.channel} data-channel={item.channel}>
          <BarRow
            label={CHANNEL_LABELS[item.channel]}
            value={item.metrics.spend}
            max={max}
            valueLabel={formatCurrency(item.metrics.spend)}
            fillClassName={CHANNEL_FILL_COLORS[item.channel]}
          />
        </li>
      ))}
    </ul>
  );
}
