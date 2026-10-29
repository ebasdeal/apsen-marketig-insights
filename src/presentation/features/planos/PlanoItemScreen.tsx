'use client';

import { NotFoundError } from '@domain/shared/DomainError';
import { ApsenLoader, ErrorState } from '@presentation/components/ui';
import { toUserMessage } from '@presentation/format/errorMessage';
import { usePlanoItem } from '@presentation/hooks/planos/usePlanos';
import { notFound } from 'next/navigation';
import { PlanoItemDetalhe } from './components/PlanoItemDetalhe';

export function PlanoItemScreen({ id }: { id: string }) {
  const query = usePlanoItem(id);
  if (query.error instanceof NotFoundError) {
    notFound();
  }
  if (query.isError) {
    return <ErrorState message={toUserMessage(query.error)} onRetry={() => void query.refetch()} />;
  }
  if (query.data === undefined) {
    return <ApsenLoader variant="content" label="Carregando item do plano…" />;
  }
  return <PlanoItemDetalhe key={query.data.id} item={query.data} />;
}
