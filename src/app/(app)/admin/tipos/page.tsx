import { TiposScreen } from '@presentation/features/tipos/TiposScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Catálogo de Tipos' };

export default function TiposPage() {
  return (
    <Suspense>
      <TiposScreen />
    </Suspense>
  );
}
