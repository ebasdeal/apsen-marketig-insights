'use client';

import type { GetCampaignDetails } from '@application/campaigns/GetCampaignDetails';
import type { ListCampaigns } from '@application/campaigns/ListCampaigns';
import type { GetDashboardSummary } from '@application/dashboard/GetDashboardSummary';
import { createContext, useContext, type ReactNode } from 'react';

export interface UseCases {
  listCampaigns: Pick<ListCampaigns, 'execute'>;
  getCampaignDetails: Pick<GetCampaignDetails, 'execute'>;
  getDashboardSummary: Pick<GetDashboardSummary, 'execute'>;
}

const UseCasesContext = createContext<UseCases | null>(null);

export function UseCasesProvider({
  useCases,
  children,
}: {
  useCases: UseCases;
  children: ReactNode;
}) {
  return <UseCasesContext.Provider value={useCases}>{children}</UseCasesContext.Provider>;
}

export function useUseCases(): UseCases {
  const useCases = useContext(UseCasesContext);
  if (useCases === null) {
    throw new Error('useUseCases deve ser usado dentro de <UseCasesProvider>');
  }
  return useCases;
}
