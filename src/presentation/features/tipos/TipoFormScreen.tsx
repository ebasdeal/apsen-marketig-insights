'use client';

import { NotFoundError } from '@domain/shared/DomainError';
import { draftNovo } from '@domain/tipos/vocabulario';
import { ErrorState, LoadingState } from '@presentation/components/ui';
import { useFonteOptions } from '@presentation/hooks/fontes/useFontes';
import { useCategorias, useTipoForm } from '@presentation/hooks/tipos/useTipos';
import { notFound } from 'next/navigation';
import { TipoForm } from './components/TipoForm';

interface TipoFormScreenProps {
  id?: string;
}

export function TipoFormScreen({ id }: TipoFormScreenProps) {
  const form = useTipoForm(id);
  const categorias = useCategorias();
  const fontes = useFonteOptions();

  if (form.error instanceof NotFoundError) {
    notFound();
  }
  const carregando = (id !== undefined && form.isPending) || categorias.isPending;
  if (carregando) {
    return <LoadingState />;
  }
  if (form.isError || categorias.isError) {
    return (
      <ErrorState
        onRetry={() => {
          if (id !== undefined) void form.refetch();
          void categorias.refetch();
        }}
      />
    );
  }
  return (
    <TipoForm
      key={id ?? 'novo'}
      id={id}
      inicial={form.data?.draft ?? draftNovo()}
      featureExtra={form.data?.featureExtra ?? null}
      categorias={categorias.data}
      fontes={fontes.data ?? []}
    />
  );
}
