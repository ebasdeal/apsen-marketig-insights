'use client';

import { useEffect, useState } from 'react';
import { FullScreenLoader } from '../../components/ui/FullScreenLoader';
import { ErrorState } from '../../components/ui/StateViews';
import { useUseCases } from '../../providers/UseCasesContext';
import { authErrorMessage } from './authErrorMessage';

export function SsoRedirect({ state }: { state: string }) {
  const useCases = useUseCases();
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    Promise.resolve()
      .then(() => useCases.auth.iniciarLogin.execute(state))
      .catch((error: unknown) => {
        if (ativo) {
          setErro(authErrorMessage(error));
        }
      });
    return () => {
      ativo = false;
    };
  }, [useCases, state, tentativa]);

  if (erro === null) {
    return <FullScreenLoader label="Redirecionando para o login…" />;
  }
  return (
    <ErrorState
      title={erro}
      onRetry={() => {
        setErro(null);
        setTentativa((value) => value + 1);
      }}
    />
  );
}
