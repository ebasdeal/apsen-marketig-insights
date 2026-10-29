'use client';

import { ErrorState } from '../ui/StateViews';

interface RouteErrorProps {
  error: Error;
  reset: () => void;
}

export function RouteError({ reset }: RouteErrorProps) {
  return (
    <ErrorState
      title="Algo deu errado"
      message="Não foi possível exibir esta página. Tente novamente em instantes."
      onRetry={reset}
    />
  );
}
