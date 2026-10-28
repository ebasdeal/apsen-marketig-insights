import { RestricoesSkeleton } from '@presentation/features/restricoes/components/RestricoesSkeleton';
import { RestricoesScreen } from '@presentation/features/restricoes/RestricoesScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Restrições & Alertas' };

export default function RestricoesPage() {
  return (
    <Suspense fallback={<RestricoesSkeleton />}>
      <RestricoesScreen />
    </Suspense>
  );
}
