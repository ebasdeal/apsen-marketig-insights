import type { DashboardSummaryOutput } from '@application/dashboard/GetDashboardSummary';
import { Section, TextLink } from '@presentation/components/ui';
import { CAMPAIGNS_ROUTE } from '@presentation/navigation/routes';
import { ChannelBreakdownList } from './ChannelBreakdownList';
import { DashboardKpiGrid } from './DashboardKpiGrid';
import { TopCampaignsList } from './TopCampaignsList';

interface DashboardContentProps {
  summary: DashboardSummaryOutput;
}

export function DashboardContent({ summary }: DashboardContentProps) {
  return (
    <>
      <DashboardKpiGrid summary={summary} />
      <div className="grid grid-cols-2 gap-x-[16px] max-[800px]:grid-cols-1">
        <Section title="Investimento por canal">
          <ChannelBreakdownList items={summary.byChannel} />
        </Section>
        <Section
          title="Top campanhas por ROAS"
          action={
            <TextLink href={CAMPAIGNS_ROUTE} variant="more" aria-label="Ver todas as campanhas">
              Ver todas →
            </TextLink>
          }
        >
          <TopCampaignsList campaigns={summary.topCampaigns} />
        </Section>
      </div>
    </>
  );
}
