import type { CampaignListItemOutput } from '@application/campaigns/dto';
import {
  clampPage,
  pageCount,
  pageRangeLabel,
  pageSlice,
} from '@presentation/components/ui/pageRange';

export const CAMPAIGNS_PER_PAGE = 8;

export interface CampaignListView {
  rows: readonly CampaignListItemOutput[];
  total: number;
  page: number;
  totalPages: number;
  rangeLabel: string;
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

export function filterCampaignsByName(
  campaigns: readonly CampaignListItemOutput[],
  search: string,
): readonly CampaignListItemOutput[] {
  const term = normalizeSearchText(search);
  if (term === '') {
    return campaigns;
  }
  return campaigns.filter((campaign) => normalizeSearchText(campaign.name).includes(term));
}

export function buildCampaignListView(
  campaigns: readonly CampaignListItemOutput[],
  search: string,
  requestedPage: number,
): CampaignListView {
  const matches = filterCampaignsByName(campaigns, search);
  const totalPages = pageCount(matches.length, CAMPAIGNS_PER_PAGE);
  const page = clampPage(requestedPage, totalPages);
  return {
    rows: pageSlice(matches, page, CAMPAIGNS_PER_PAGE),
    total: matches.length,
    page,
    totalPages,
    rangeLabel: pageRangeLabel(page, CAMPAIGNS_PER_PAGE, matches.length),
  };
}

export function campaignCountNoun(total: number): string {
  return total === 1 ? 'campanha' : 'campanhas';
}
