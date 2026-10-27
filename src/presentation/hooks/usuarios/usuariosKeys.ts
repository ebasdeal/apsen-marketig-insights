import type { UsuarioFiltro } from '@domain/usuarios/Usuario';

export interface UsuariosPagina {
  page: number;
  size: number;
}

export const usuariosKeys = {
  all: ['usuarios'] as const,
  pages: () => ['usuarios', 'page'] as const,
  page: (filtro: UsuarioFiltro, pagina: UsuariosPagina) =>
    ['usuarios', 'page', filtro, pagina] as const,
  form: (id: string) => ['usuarios', 'form', id] as const,
};

export const permissoesKeys = {
  all: ['permissoes'] as const,
  list: () => ['permissoes', 'list'] as const,
};
