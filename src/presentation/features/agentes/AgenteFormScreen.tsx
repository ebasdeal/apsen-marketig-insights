'use client';

import { novoAgenteDraft } from '@domain/agentes/agenteRules';
import { NotFoundError } from '@domain/shared/DomainError';
import { ApsenLoader, ErrorState } from '@presentation/components/ui';
import { notFound } from 'next/navigation';
import { useAgenteForm } from '../../hooks/agentes/useAgentes';
import { AgenteForm } from './AgenteForm';

function EditarAgente({ id }: { id: string }) {
  const query = useAgenteForm(id);
  if (query.isPending) {
    return <ApsenLoader variant="content" label="Carregando agente…" />;
  }
  if (query.isError) {
    if (query.error instanceof NotFoundError) {
      notFound();
    }
    return (
      <ErrorState
        message="Não foi possível carregar o agente."
        onRetry={() => void query.refetch()}
      />
    );
  }
  return <AgenteForm id={id} draft={query.data.draft} extras={query.data.extras} />;
}

export function AgenteFormScreen({ id }: { id?: string }) {
  return id === undefined ? (
    <AgenteForm draft={novoAgenteDraft()} extras={{}} />
  ) : (
    <EditarAgente id={id} />
  );
}
