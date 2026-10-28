import { AnalisesListSkeleton } from '@presentation/features/analises/components/AnalisesSkeleton';
import { AnalisesScreen } from '@presentation/features/analises/AnalisesScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Análises' };

export default function AnalisesPage() {
  return (
    <Suspense fallback={<AnalisesListSkeleton />}>
      <AnalisesScreen />
    </Suspense>
  );
}
