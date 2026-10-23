'use client';

import {
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  ScreenDesc,
} from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { useCampaigns } from '@presentation/hooks/useCampaigns';
import {
  hasActiveFilters,
  useCampaignFiltersStore,
} from '@presentation/stores/campaignFiltersStore';
import { buildCampaignListView } from './campaignListView';
import { CampaignFilters } from './components/CampaignFilters';
import { CampaignResultSummary } from './components/CampaignResultSummary';
import { CampaignTable } from './components/CampaignTable';

const EMPTY_FILTERED = 'Nenhuma campanha encontrada com os filtros atuais.';
const EMPTY_ALL = 'Nenhuma campanha cadastrada.';

function useCampaignListState() {
  const channel = useCampaignFiltersStore((state) => state.channel);
  const status = useCampaignFiltersStore((state) => state.status);
  const period = useCampaignFiltersStore((state) => state.period);
  const search = useCampaignFiltersStore((state) => state.search);
  const page = useCampaignFiltersStore((state) => state.page);
  const setPage = useCampaignFiltersStore((state) => state.setPage);
  const query = useCampaigns({ channel, status, period });
  const filtered = hasActiveFilters({ channel, status, period, search });
  return { query, search, page, setPage, filtered };
}

function CampaignListContent() {
  const { query, search, page, setPage, filtered } = useCampaignListState();

  if (query.isPending) {
    return <LoadingState label="Carregando campanhas…" />;
  }
  if (query.isError) {
    return <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />;
  }
  const view = buildCampaignListView(query.data, search, page);
  return (
    <>
      <CampaignResultSummary count={view.total} />
      <CampaignTable campaigns={view.rows} emptyText={filtered ? EMPTY_FILTERED : EMPTY_ALL} />
      <Pagination
        page={view.page}
        totalPages={view.totalPages}
        info={view.rangeLabel}
        onPageChange={setPage}
      />
    </>
  );
}

export function CampaignListScreen() {
  return (
    <>
      <PageHeader title="Campanhas" description="Acompanhe o desempenho das suas campanhas." />
      <ScreenDesc icon="📣">
        Acompanhe o desempenho das campanhas. Busque pelo nome, filtre por canal, status ou período
        e abra uma campanha para ver o <em>detalhe de métricas e orçamento</em>.
      </ScreenDesc>
      <CampaignFilters />
      <CampaignListContent />
    </>
  );
}
