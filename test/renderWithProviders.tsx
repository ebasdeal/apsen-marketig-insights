import { AppProviders } from '@presentation/providers/AppProviders';
import type { UseCases } from '@presentation/providers/UseCasesContext';
import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { createFakeCiclosUseCases } from './fakes/ciclos';
import { createFakeFontesUseCases } from './fakes/fontes';
import { NAV_BADGES_FIXTURE } from './fixtures/navBadges';
import { PERFIS_FIXTURE } from './fixtures/perfis';
import { SESSAO_ADMIN } from './fixtures/sessao';

export type FakeUseCasesOverrides = { [K in keyof UseCases]?: Partial<UseCases[K]> };

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryDelay: 0, gcTime: Infinity, staleTime: 0 },
    },
  });
}

export function createFakeUseCases(overrides: FakeUseCasesOverrides = {}): UseCases {
  return {
    auth: {
      concluirLogin: { execute: vi.fn().mockResolvedValue(SESSAO_ADMIN) },
      sessaoAtual: { execute: vi.fn().mockResolvedValue(SESSAO_ADMIN.usuario) },
      sair: { execute: vi.fn().mockResolvedValue(undefined) },
      iniciarLogin: { execute: vi.fn() },
      encerrarNoProvedor: { execute: vi.fn() },
      ...overrides.auth,
    },
    perfis: {
      list: { execute: vi.fn().mockResolvedValue(PERFIS_FIXTURE) },
      ...overrides.perfis,
    },
    navegacao: {
      badges: { execute: vi.fn().mockResolvedValue(NAV_BADGES_FIXTURE) },
      ...overrides.navegacao,
    },
    ciclos: createFakeCiclosUseCases(overrides.ciclos),
    fontes: createFakeFontesUseCases(overrides.fontes),
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
