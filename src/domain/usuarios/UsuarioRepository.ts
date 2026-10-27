import type { Page } from '../shared/Page';
import type { Usuario, UsuarioFiltro, UsuarioPatch } from './Usuario';

export interface UsuarioPageRequest {
  page: number;
  size: number;
}

export interface UsuarioRepository {
  listPage(filtro: UsuarioFiltro, page: UsuarioPageRequest): Promise<Page<Usuario>>;
  get(id: string): Promise<Usuario>;
  findByEmail(email: string): Promise<readonly Usuario[]>;
  create(usuario: Usuario): Promise<Usuario>;
  update(id: string, patch: UsuarioPatch): Promise<Usuario>;
  delete(id: string): Promise<void>;
}
