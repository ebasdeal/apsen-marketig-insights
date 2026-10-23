'use client';

import { AppProviders } from '@presentation/providers/AppProviders';
import { createQueryClient } from '@presentation/providers/queryClient';
import { useState, type ReactNode } from 'react';
import { createContainerFromProcessEnv, type Container } from './container';

interface AppRootProps {
  children: ReactNode;
  container?: Container;
}

export function AppRoot({ children, container }: AppRootProps) {
  const [resolved] = useState(() => container ?? createContainerFromProcessEnv());
  const [queryClient] = useState(createQueryClient);
  return (
    <AppProviders useCases={resolved.useCases} queryClient={queryClient}>
      {children}
    </AppProviders>
  );
}
