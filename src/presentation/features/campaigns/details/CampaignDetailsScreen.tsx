'use client';

import type { CampaignDetailsOutput } from '@application/campaigns/dto';
import { CampaignNotFoundError } from '@domain/shared/DomainError';
import { ButtonLink, ErrorState, LoadingState } from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { useCampaignDetails } from '@presentation/hooks/useCampaignDetails';
import { CAMPAIGNS_ROUTE } from '@presentation/navigation/routes';
import { BackToCampaignsLink } from './components/BackToCampaignsLink';
import { BudgetUsage } from './components/BudgetUsage';
import { CampaignCrumb } from './components/CampaignCrumb';
import { CampaignHeader } from './components/CampaignHeader';
import { CampaignKpiGrid } from './components/CampaignKpiGrid';
import { MetricsGrid } from './components/MetricsGrid';

interface CampaignDetailsScreenProps {
  id: string;
}

type CampaignDetailsQuery = ReturnType<typeof useCampaignDetails>;

function CampaignDetailsContent({ campaign }: { campaign: CampaignDetailsOutput }) {
  return (
    <>
      <CampaignHeader campaign={campaign} />
      <BudgetUsage
        spend={campaign.spend}
        budget={campaign.budget}
        usage={campaign.budgetUsage}
        overBudget={campaign.overBudget}
      />
      <CampaignKpiGrid campaign={campaign} />
      <MetricsGrid campaign={campaign} />
    </>
  );
}

function CampaignNotFound() {
  return (
    <ErrorState
      icon="🔍"
      title="Campanha não encontrada"
      action={
        <ButtonLink href={CAMPAIGNS_ROUTE} variant="outline">
          <span aria-hidden="true">←</span> Voltar para Campanhas
        </ButtonLink>
      }
    />
  );
}

function CampaignDetailsBody({ query }: { query: CampaignDetailsQuery }) {
  if (query.isError) {
    if (query.error instanceof CampaignNotFoundError) return <CampaignNotFound />;
    return <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />;
  }
  if (query.data === undefined) return <LoadingState label="Carregando campanha…" />;
  return <CampaignDetailsContent campaign={query.data} />;
}

export function CampaignDetailsScreen({ id }: CampaignDetailsScreenProps) {
  const query = useCampaignDetails(id);
  return (
    <div className="flex flex-col">
      {query.data === undefined ? null : <CampaignCrumb name={query.data.name} />}
      <BackToCampaignsLink />
      <CampaignDetailsBody query={query} />
    </div>
  );
}
