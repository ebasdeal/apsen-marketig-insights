import { TableSkeleton } from '@presentation/components/ui';
import { CATALOG_HEADERS, CatalogScreen } from '@presentation/features/catalogo/CatalogScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Catálogo de Produtos' };

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <TableSkeleton columns={5} headers={CATALOG_HEADERS} label="Carregando catálogo…" />
      }
    >
      <CatalogScreen />
    </Suspense>
  );
}
