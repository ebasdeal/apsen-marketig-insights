import { ApsenLoader } from '@presentation/components/ui';
import { DriversListScreen } from '@presentation/features/drivers/list/DriversListScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Meus Registros' };

export default function DriversPage() {
  return (
    <Suspense fallback={<ApsenLoader variant="content" label="Carregando registros…" />}>
      <DriversListScreen />
    </Suspense>
  );
}
