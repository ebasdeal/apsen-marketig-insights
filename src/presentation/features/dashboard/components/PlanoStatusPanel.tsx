import type { DashboardOverviewOutput } from '@application/dashboard/dto';
import { Section, StatusDistributionRow, TextLink } from '@presentation/components/ui';
import { TOM_STATUS_PLANO } from '../dashboardStyles';

interface PlanoStatusPanelProps {
  plano: DashboardOverviewOutput['plano'];
  ciclo: string | null;
}

export function PlanoStatusPanel({ plano, ciclo }: PlanoStatusPanelProps) {
  return (
    <Section
      variant="panel"
      title="Plano de Produção — Status"
      action={
        <TextLink href="/planos" variant="more" aria-label="Ver plano de produção">
          Ver plano →
        </TextLink>
      }
    >
      {plano.status.map((linha) => (
        <StatusDistributionRow
          key={linha.status}
          label={linha.label}
          count={linha.n}
          pct={linha.pct ?? 0}
          {...(linha.pct === null ? { pctLabel: '—' } : {})}
          tone={TOM_STATUS_PLANO[linha.status]}
        />
      ))}
      <p className="border-t border-apsen-border pt-[8px] text-[12px] text-apsen-muted">
        {`${plano.total} itens · ${ciclo ?? '—'}`}
      </p>
    </Section>
  );
}
