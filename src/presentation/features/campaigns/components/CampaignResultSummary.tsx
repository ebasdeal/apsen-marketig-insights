'use client';

import { Button, ResultSummary } from '@presentation/components/ui';
import { PERIOD_LABELS } from '@presentation/format/labels';
import {
  hasActiveFilters,
  useCampaignFiltersStore,
} from '@presentation/stores/campaignFiltersStore';
import { campaignCountNoun } from '../campaignListView';

interface CampaignResultSummaryProps {
  count: number;
}

export function CampaignResultSummary({ count }: CampaignResultSummaryProps) {
  const channel = useCampaignFiltersStore((state) => state.channel);
  const status = useCampaignFiltersStore((state) => state.status);
  const period = useCampaignFiltersStore((state) => state.period);
  const search = useCampaignFiltersStore((state) => state.search);
  const reset = useCampaignFiltersStore((state) => state.reset);
  const filtered = hasActiveFilters({ channel, status, period, search });

  return (
    <ResultSummary
      action={
        filtered ? (
          <Button variant="ghost" size="sm" onClick={reset}>
            Limpar filtros
          </Button>
        ) : undefined
      }
    >
      <strong>{count}</strong> {`${campaignCountNoun(count)} · ${PERIOD_LABELS[period]}`}
    </ResultSummary>
  );
}
