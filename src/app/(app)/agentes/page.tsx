import { ApsenLoader } from '@presentation/components/ui';
import { AgentesScreen } from '@presentation/features/agentes/AgentesScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Agentes de IA' };

export default function AgentesPage() {
  return (
    <Suspense fallback={<ApsenLoader variant="content" />}>
      <AgentesScreen />
    </Suspense>
  );
}
