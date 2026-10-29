import type { DashboardOverviewOutput } from '@application/dashboard/dto';
import { InlineEmpty, PendingItemRow, Section, TextLink } from '@presentation/components/ui';

export function PendentesPanel({ pendentes }: { pendentes: DashboardOverviewOutput['pendentes'] }) {
  return (
    <Section
      variant="panel"
      title="Aguardando Aprovação"
      action={
        <TextLink
          href="/admin/aprovacoes"
          variant="more"
          aria-label="Ver todos os drivers pendentes"
        >
          Ver todos →
        </TextLink>
      }
    >
      {pendentes.itens.length === 0 ? (
        <InlineEmpty>✅ Nenhum driver pendente</InlineEmpty>
      ) : (
        <>
          {pendentes.itens.map((item) => (
            <PendingItemRow
              key={item.id}
              code={item.id}
              title={item.produto}
              subtitle={item.tipo}
              actionLabel="Revisar"
              actionHref="/admin/aprovacoes"
            />
          ))}
          {pendentes.restantes > 0 ? (
            <p className="py-[6px] text-center text-[12px] text-apsen-muted">
              {`+mais ${pendentes.restantes}`}
            </p>
          ) : null}
        </>
      )}
    </Section>
  );
}
