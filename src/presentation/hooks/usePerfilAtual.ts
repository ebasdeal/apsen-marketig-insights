'use client';

import type { PerfilDto } from '@application/perfis/dto';
import { useSessaoStore } from '../stores/sessaoStore';
import { usePerfis } from './usePerfis';

export type PerfilAtualStatus = 'loading' | 'error' | 'missing' | 'ready';

export interface PerfilAtual {
  perfil: PerfilDto | undefined;
  perfis: PerfilDto[];
  status: PerfilAtualStatus;
  refetch: () => void;
}

const EMPTY: PerfilDto[] = [];

export function usePerfilAtual(): PerfilAtual {
  const perfilId = useSessaoStore((state) => state.sessao?.usuario.perfil);
  const query = usePerfis();
  const perfis = query.data ?? EMPTY;
  const perfil = perfis.find((candidate) => candidate.id === perfilId);
  const refetch = () => {
    void query.refetch();
  };
  if (query.isPending && perfilId !== undefined) {
    return { perfil: undefined, perfis, status: 'loading', refetch };
  }
  if (query.isError) {
    return { perfil: undefined, perfis, status: 'error', refetch };
  }
  return { perfil, perfis, status: perfil === undefined ? 'missing' : 'ready', refetch };
}
