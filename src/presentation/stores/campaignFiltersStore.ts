import type { PeriodPreset } from '@application/campaigns/periodPresets';
import type { CampaignStatus } from '@domain/campaign/CampaignStatus';
import type { Channel } from '@domain/campaign/Channel';
import { create } from 'zustand';

export interface CampaignFiltersValues {
  channel: Channel | null;
  status: CampaignStatus | null;
  period: PeriodPreset;
}

export interface CampaignListFilters extends CampaignFiltersValues {
  search: string;
  page: number;
}

interface CampaignFiltersState extends CampaignListFilters {
  setChannel: (channel: Channel | null) => void;
  setStatus: (status: CampaignStatus | null) => void;
  setPeriod: (period: PeriodPreset) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  reset: () => void;
}

export const INITIAL_CAMPAIGN_FILTERS: CampaignListFilters = {
  channel: null,
  status: null,
  period: 'all',
  search: '',
  page: 1,
};

const FIRST_PAGE = { page: INITIAL_CAMPAIGN_FILTERS.page };

export const useCampaignFiltersStore = create<CampaignFiltersState>()((set) => ({
  ...INITIAL_CAMPAIGN_FILTERS,
  setChannel: (channel) => set({ channel, ...FIRST_PAGE }),
  setStatus: (status) => set({ status, ...FIRST_PAGE }),
  setPeriod: (period) => set({ period, ...FIRST_PAGE }),
  setSearch: (search) => set({ search, ...FIRST_PAGE }),
  setPage: (page) => set({ page }),
  reset: () => set(INITIAL_CAMPAIGN_FILTERS),
}));

export function hasActiveFilters(values: Omit<CampaignListFilters, 'page'>): boolean {
  return (
    values.channel !== INITIAL_CAMPAIGN_FILTERS.channel ||
    values.status !== INITIAL_CAMPAIGN_FILTERS.status ||
    values.period !== INITIAL_CAMPAIGN_FILTERS.period ||
    values.search.trim() !== INITIAL_CAMPAIGN_FILTERS.search
  );
}
