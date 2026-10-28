import { PageSkeleton } from '@presentation/components/ui';
import { UsuariosScreen } from '@presentation/features/usuarios/UsuariosScreen';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Usuários' };

export default function UsuariosPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <UsuariosScreen />
    </Suspense>
  );
}
