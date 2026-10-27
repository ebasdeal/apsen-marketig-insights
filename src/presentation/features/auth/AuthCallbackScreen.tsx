'use client';

import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { ErrorState } from '../../components/ui/StateViews';
import { useSessao } from '../../hooks/useSessao';
import { safeNext } from '../../navigation/safeNext';
import { useUseCases } from '../../providers/UseCasesContext';
import { authErrorMessage } from './authErrorMessage';

export function AuthCallbackScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const useCases = useUseCases();
  const { concluirLogin } = useSessao();
  const code = searchParams.get('code');
  const destino = safeNext(searchParams.get('state'));
  const [erro, setErro] = useState<string | null>(null);
  const consumido = useRef<string | null | undefined>(undefined);
  const container = useRef<HTMLElement>(null);

  useEffect(() => {
    if (consumido.current === code) {
      return;
    }
    consumido.current = code;
    concluirLogin(code)
      .then(() => router.replace(destino as Route))
      .catch((error: unknown) => setErro(authErrorMessage(error)));
  }, [code, destino, concluirLogin, router]);

  useEffect(() => {
    const title = container.current?.querySelector<HTMLElement>('h3');
    if (erro !== null && title) {
      title.tabIndex = -1;
      title.focus();
    }
  }, [erro]);

  const tentarNovamente = () => {
    try {
      useCases.auth.iniciarLogin.execute(destino);
    } catch (error) {
      setErro(authErrorMessage(error));
    }
  };

  return (
    <main
      ref={container}
      className="flex min-h-dvh items-center justify-center bg-apsen-bg px-[24px]"
    >
      {erro === null ? (
        <FullScreenLoader label="Entrando…" />
      ) : (
        <ErrorState title={erro} onRetry={tentarNovamente} />
      )}
    </main>
  );
}
