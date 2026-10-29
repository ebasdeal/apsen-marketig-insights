import { ApsenLoader } from '@presentation/components/ui';
import { CatalogScreen } from '@presentation/features/catalogo/CatalogScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Catálogo de Produtos' };

export default function CatalogoPage() {
  return (
    <Suspense fallback={<ApsenLoader variant="content" label="Carregando catálogo…" />}>
      <CatalogScreen />
    </Suspense>
  );
}
