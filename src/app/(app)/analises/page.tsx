import { ApsenLoader } from '@presentation/components/ui';
import { AnalisesScreen } from '@presentation/features/analises/AnalisesScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Análises' };

export default function AnalisesPage() {
  return (
    <Suspense fallback={<ApsenLoader variant="content" label="Carregando análises…" />}>
      <AnalisesScreen />
    </Suspense>
  );
}
