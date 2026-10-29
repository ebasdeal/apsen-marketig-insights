import { ApsenLoader } from '@presentation/components/ui';
import { PlanosScreen } from '@presentation/features/planos/PlanosScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Planos de Produção' };

export default function PlanosPage() {
  return (
    <Suspense fallback={<ApsenLoader variant="content" label="Carregando itens do plano…" />}>
      <PlanosScreen />
    </Suspense>
  );
}
