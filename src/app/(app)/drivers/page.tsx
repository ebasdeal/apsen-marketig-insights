import { DriversListScreen } from '@presentation/features/drivers/list/DriversListScreen';
import { DriversListSkeleton } from '@presentation/features/drivers/list/DriversListSkeleton';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Meus Registros' };

export default function DriversPage() {
  return (
    <Suspense fallback={<DriversListSkeleton />}>
      <DriversListScreen />
    </Suspense>
  );
}
