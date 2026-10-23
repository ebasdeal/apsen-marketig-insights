'use client';

import { PERIOD_OPTIONS } from '@presentation/components/filterOptions';
import {
  Button,
  ChipGroup,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { useDashboardSummary } from '@presentation/hooks/useDashboardSummary';
import { useCampaignFiltersStore } from '@presentation/stores/campaignFiltersStore';
import { DashboardContent } from './components/DashboardContent';

type DashboardQuery = ReturnType<typeof useDashboardSummary>;

interface DashboardQueryProps {
  query: DashboardQuery;
}

function RefreshButton({ query }: DashboardQueryProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => void query.refetch()}
      disabled={query.isFetching}
      aria-busy={query.isFetching}
    >
      {query.isRefetching ? 'Atualizando…' : 'Atualizar'}
    </Button>
  );
}

function DashboardBody({ query }: DashboardQueryProps) {
  if (query.isPending) {
    return <LoadingState label="Carregando indicadores…" />;
  }
  if (query.isError) {
    return <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />;
  }
  if (query.data.campaignCount === 0) {
    return (
      <EmptyState
        title="Sem campanhas no período"
        description="Escolha outro período para ver os indicadores."
      />
    );
  }
  return <DashboardContent summary={query.data} />;
}

export function DashboardScreen() {
  const period = useCampaignFiltersStore((state) => state.period);
  const setPeriod = useCampaignFiltersStore((state) => state.setPeriod);
  const query = useDashboardSummary(period);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do desempenho das campanhas."
        actions={
          <>
            <ChipGroup
              label="Período"
              options={PERIOD_OPTIONS}
              selected={period}
              onSelect={setPeriod}
              hideLabel
            />
            <RefreshButton query={query} />
          </>
        }
      />
      <DashboardBody query={query} />
    </>
  );
}
