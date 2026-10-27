'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { ErrorState } from '../../components/ui/StateViews';
import { queryKeys } from '../../hooks/queryKeys';
import { useUseCases } from '../../providers/UseCasesContext';
import { useSessaoStore } from '../../stores/sessaoStore';
import { SsoRedirect } from './SsoRedirect';

function currentPath(pathname: string): string {
  return `${pathname}${window.location.search}`;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const useCases = useUseCases();
  const hidratado = useSessaoStore((state) => state.hidratado);
  const sessao = useSessaoStore((state) => state.sessao);
  const atualizarUsuario = useSessaoStore((state) => state.atualizarUsuario);
  const saindo = useSessaoStore((state) => state.saindo);
  const semSessao = hidratado && sessao === null;

  const me = useQuery({
    queryKey: queryKeys.auth.me(sessao?.usuario.id ?? ''),
    queryFn: () => useCases.auth.sessaoAtual.execute(),
    enabled: sessao !== null,
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (semSessao) {
      queryClient.clear();
    }
  }, [semSessao, queryClient]);

  useEffect(() => {
    if (me.data !== undefined) {
      atualizarUsuario(me.data);
    }
  }, [me.data, atualizarUsuario]);

  if (semSessao && saindo) {
    return <FullScreenLoader label="Saindo…" />;
  }
  if (semSessao) {
    return <SsoRedirect state={currentPath(pathname)} />;
  }
  if (!hidratado || sessao === null || me.isPending) {
    return <FullScreenLoader label="Verificando sua sessão…" />;
  }
  if (me.isError) {
    return (
      <ErrorState
        title="Não foi possível validar a sessão"
        message="Verifique se a API local está no ar e tente novamente."
        onRetry={() => void me.refetch()}
      />
    );
  }
  return children;
}
