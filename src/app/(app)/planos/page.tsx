import { PlanosSkeleton } from '@presentation/features/planos/components/PlanosSkeleton';
import { PlanosScreen } from '@presentation/features/planos/PlanosScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Planos de Produção' };

export default function PlanosPage() {
  return (
    <Suspense fallback={<PlanosSkeleton />}>
      <PlanosScreen />
    </Suspense>
  );
}
