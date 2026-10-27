'use client';

import { podeAcessar } from '@domain/perfis/acesso';
import { matchScreen } from '@presentation/navigation/screens';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { usePerfilAtual } from '../../hooks/usePerfilAtual';
import { ErrorState, LoadingState } from '../ui/StateViews';
import { AccessDenied } from './AccessDenied';

export function AccessGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { perfil, status, refetch } = usePerfilAtual();
  const minimo = matchScreen(pathname)?.nivelMinimo ?? null;
  if (minimo === null || minimo === 1) {
    return children;
  }
  if (status === 'loading') {
    return <LoadingState />;
  }
  if (perfil === undefined) {
    return (
      <ErrorState
        title="Não foi possível carregar os perfis de acesso"
        message="Verifique se a API local está no ar e tente novamente."
        onRetry={refetch}
      />
    );
  }
  if (!podeAcessar(perfil.nivel, minimo)) {
    return <AccessDenied perfil={perfil} />;
  }
  return children;
}
