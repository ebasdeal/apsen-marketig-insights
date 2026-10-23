'use client';

import { FormSelect, SearchInput } from '@presentation/components/ui';
import { useCampaignFiltersStore } from '@presentation/stores/campaignFiltersStore';
import {
  CHANNEL_SELECT_OPTIONS,
  PERIOD_SELECT_OPTIONS,
  STATUS_SELECT_OPTIONS,
  fromSelectValue,
  toSelectValue,
} from '../campaignFilterOptions';

export function CampaignFilters() {
  const search = useCampaignFiltersStore((state) => state.search);
  const channel = useCampaignFiltersStore((state) => state.channel);
  const status = useCampaignFiltersStore((state) => state.status);
  const period = useCampaignFiltersStore((state) => state.period);
  const setSearch = useCampaignFiltersStore((state) => state.setSearch);
  const setChannel = useCampaignFiltersStore((state) => state.setChannel);
  const setStatus = useCampaignFiltersStore((state) => state.setStatus);
  const setPeriod = useCampaignFiltersStore((state) => state.setPeriod);

  return (
    <div
      role="search"
      aria-label="Filtros"
      className="mb-[12px] flex flex-wrap items-center gap-[10px]"
    >
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar campanha pelo nome..."
        aria-label="Buscar campanha"
        className="min-w-[220px]"
      />
      <FormSelect
        aria-label="Canal"
        value={toSelectValue(channel)}
        options={CHANNEL_SELECT_OPTIONS}
        onChange={(value) => setChannel(fromSelectValue(value))}
        className="w-[180px]"
      />
      <FormSelect
        aria-label="Status"
        value={toSelectValue(status)}
        options={STATUS_SELECT_OPTIONS}
        onChange={(value) => setStatus(fromSelectValue(value))}
        className="w-[170px]"
      />
      <FormSelect
        aria-label="Período"
        value={period}
        options={PERIOD_SELECT_OPTIONS}
        onChange={setPeriod}
        className="w-[170px]"
      />
    </div>
  );
}
