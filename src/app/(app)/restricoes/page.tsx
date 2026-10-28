import { ApsenLoader } from '@presentation/components/ui';
import { RestricoesScreen } from '@presentation/features/restricoes/RestricoesScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Restrições & Alertas' };

export default function RestricoesPage() {
  return (
    <Suspense fallback={<ApsenLoader variant="content" label="Carregando restrições…" />}>
      <RestricoesScreen />
    </Suspense>
  );
}
