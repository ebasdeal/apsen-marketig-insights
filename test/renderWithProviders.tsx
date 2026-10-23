import { AppProviders } from '@presentation/providers/AppProviders';
import type { UseCases } from '@presentation/providers/UseCasesContext';
import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0, gcTime: Infinity, staleTime: 0 },
    },
  });
}

export function createFakeUseCases(overrides: Partial<UseCases> = {}): UseCases {
  return {
    listCampaigns: { execute: vi.fn().mockResolvedValue([]) },
    getCampaignDetails: { execute: vi.fn().mockRejectedValue(new Error('não configurado')) },
    getDashboardSummary: { execute: vi.fn().mockRejectedValue(new Error('não configurado')) },
    ...overrides,
  };
}

export function createWrapper(useCases: UseCases, queryClient = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AppProviders useCases={useCases} queryClient={queryClient}>
        {children}
      </AppProviders>
    );
  };
}

export function renderWithProviders(ui: ReactElement, useCases: UseCases = createFakeUseCases()) {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();
  const result = render(ui, { wrapper: createWrapper(useCases, queryClient) });
  return { ...result, user, queryClient };
}
