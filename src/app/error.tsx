'use client';

import { ErrorState } from '@presentation/components/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <ErrorState
      title="Algo deu errado"
      message="Não foi possível exibir esta página. Tente novamente em instantes."
      onRetry={reset}
    />
  );
}
