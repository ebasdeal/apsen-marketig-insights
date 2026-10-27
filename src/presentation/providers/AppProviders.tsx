'use client';

import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ThemeSync } from '../theme/ThemeSync';
import { SessionSync } from './SessionSync';
import { ToastProvider } from './ToastProvider';
import { UseCasesProvider, type UseCases } from './UseCasesContext';

interface AppProvidersProps {
  useCases: UseCases;
  queryClient: QueryClient;
  children: ReactNode;
}

export function AppProviders({ useCases, queryClient, children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UseCasesProvider useCases={useCases}>
        <ToastProvider>
          <ThemeSync />
          <SessionSync />
          {children}
        </ToastProvider>
      </UseCasesProvider>
    </QueryClientProvider>
  );
}
