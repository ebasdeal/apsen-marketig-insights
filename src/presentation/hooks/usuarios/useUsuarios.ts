'use client';

import type { UsuarioFiltro } from '@domain/usuarios/Usuario';
import { USUARIO_PAGE_SIZE } from '@domain/usuarios/vocabulario';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CATALOG_STALE_TIME, DEFAULT_STALE_TIME } from '../../providers/queryClient';
import { useUseCases } from '../../providers/UseCasesContext';
import { retryExcetoNotFound } from '../retryExcetoNotFound';
import { permissoesKeys, usuariosKeys, type UsuariosPagina } from './usuariosKeys';

export function useUsuariosPage(
  filtro: UsuarioFiltro,
  { page, size = USUARIO_PAGE_SIZE }: { page: number; size?: number },
) {
  const { usuarios } = useUseCases();
  const pagina: UsuariosPagina = { page, size };
  return useQuery({
    queryKey: usuariosKeys.page(filtro, pagina),
    queryFn: () => usuarios.list.execute({ ...filtro, page, size }),
    placeholderData: keepPreviousData,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useUsuarioForm(id: string) {
  const { usuarios } = useUseCases();
  return useQuery({
    queryKey: usuariosKeys.form(id),
    queryFn: () => usuarios.getForm.execute(id),
    retry: retryExcetoNotFound,
  });
}

export function usePermissoes() {
  const { permissoes } = useUseCases();
  return useQuery({
    queryKey: permissoesKeys.list(),
    queryFn: () => permissoes.list.execute(),
    staleTime: CATALOG_STALE_TIME,
  });
}
