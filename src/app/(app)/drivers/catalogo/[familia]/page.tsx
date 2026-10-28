import { ApsenLoader } from '@presentation/components/ui';
import { FamiliaDriversScreen } from '@presentation/features/catalogo/FamiliaDriversScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Drivers da Família' };

interface FamiliaPageProps {
  params: Promise<{ familia: string }>;
}

export default async function FamiliaDriversPage({ params }: FamiliaPageProps) {
  const familia = decodeURIComponent((await params).familia);
  return (
    <Suspense fallback={<ApsenLoader variant="content" label="Carregando drivers da família…" />}>
      <FamiliaDriversScreen key={familia} familia={familia} />
    </Suspense>
  );
}
