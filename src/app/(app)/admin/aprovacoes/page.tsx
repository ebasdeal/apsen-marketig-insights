import { AprovacoesScreen } from '@presentation/features/aprovacoes/AprovacoesScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Fila de Aprovação' };

export default function AprovacoesPage() {
  return (
    <Suspense>
      <AprovacoesScreen />
    </Suspense>
  );
}
