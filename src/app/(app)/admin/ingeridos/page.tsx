import { IngeridosScreen } from '@presentation/features/ingeridos/IngeridosScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Drivers Ingeridos' };

export default function IngeridosPage() {
  return (
    <Suspense>
      <IngeridosScreen />
    </Suspense>
  );
}
