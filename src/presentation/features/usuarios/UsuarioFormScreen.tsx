'use client';

import { NotFoundError } from '@domain/shared/DomainError';
import { novoUsuarioDraft } from '@domain/usuarios/Usuario';
import { CardSkeleton, ErrorState } from '@presentation/components/ui';
import { notFound } from 'next/navigation';
import { useUsuarioForm } from '../../hooks/usuarios/useUsuarios';
import { UsuarioForm } from './UsuarioForm';

function EditarUsuario({ id }: { id: string }) {
  const query = useUsuarioForm(id);
  if (query.isPending) {
    return <CardSkeleton />;
  }
  if (query.isError) {
    if (query.error instanceof NotFoundError) {
      notFound();
    }
    return (
      <ErrorState
        message="Não foi possível carregar o usuário."
        onRetry={() => void query.refetch()}
      />
    );
  }
  return (
    <UsuarioForm
      id={id}
      initial={query.data.draft}
      areaExtra={query.data.areaExtra}
      alteracao={query.data.alteracao}
    />
  );
}

export function UsuarioFormScreen({ id }: { id?: string }) {
  return id === undefined ? (
    <UsuarioForm initial={novoUsuarioDraft()} areaExtra={null} />
  ) : (
    <EditarUsuario id={id} />
  );
}
