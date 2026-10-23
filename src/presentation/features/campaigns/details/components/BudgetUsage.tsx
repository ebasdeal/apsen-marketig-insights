import { ProgressBar, Section } from '@presentation/components/ui';
import { formatCurrency, formatPercent } from '@presentation/format/formatters';

interface BudgetUsageProps {
  spend: number;
  budget: number;
  usage: number | null;
  overBudget: boolean;
}

function BudgetNote({ usage, overBudget }: Pick<BudgetUsageProps, 'usage' | 'overBudget'>) {
  if (overBudget) {
    return (
      <p role="alert" className="mt-[6px] text-[12px] text-apsen-red">
        Orçamento excedido
      </p>
    );
  }
  if (usage === null) return null;
  return <p className="mt-[6px] text-[12px] text-apsen-muted">Dentro do orçamento</p>;
}

export function BudgetUsage({ spend, budget, usage, overBudget }: BudgetUsageProps) {
  return (
    <Section title="💰 Orçamento" variant="detail">
      <div className="mb-[8px] flex justify-between text-[13px]">
        <span>{`${formatCurrency(spend)} de ${formatCurrency(budget)}`}</span>
        <span className="font-bold">{formatPercent(usage)}</span>
      </div>
      <ProgressBar value={usage} label="Uso do orçamento" />
      <BudgetNote usage={usage} overBudget={overBudget} />
    </Section>
  );
}
