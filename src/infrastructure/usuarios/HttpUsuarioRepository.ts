import { NotFoundError } from '@domain/shared/DomainError';
import type { Page } from '@domain/shared/Page';
import type { Usuario, UsuarioFiltro, UsuarioPatch } from '@domain/usuarios/Usuario';
import type { UsuarioPageRequest, UsuarioRepository } from '@domain/usuarios/UsuarioRepository';
import type { HttpClient } from '../http/HttpClient';
import { toPageQuery } from '../http/pageQuery';
import { isNotFound, parseContract } from '../http/parseContract';
import { toUsuario } from './usuarioMapper';
import { usuarioDtoSchema, usuariosDtoSchema } from './usuarioSchema';

const RECURSO = '/usuarios';

export class HttpUsuarioRepository implements UsuarioRepository {
  constructor(private readonly http: HttpClient) {}

  async listPage(
    filtro: UsuarioFiltro,
    { page, size }: UsuarioPageRequest,
  ): Promise<Page<Usuario>> {
    const query = toPageQuery({
      page,
      limit: size,
      sort: 'nome',
      order: 'asc',
      ...(filtro.q === undefined ? {} : { search: filtro.q }),
      filters: filtro.perfil === undefined ? {} : { perfil: filtro.perfil },
    });
    const result = await this.http.getPage(RECURSO, { query });
    const items = parseContract(usuariosDtoSchema, result.data, RECURSO).map(toUsuario);
    return { items, total: result.total, page, limit: size };
  }

  async get(id: string): Promise<Usuario> {
    const payload = await this.http.get(this.path(id)).catch((error: unknown) => {
      throw isNotFound(error) ? new NotFoundError('Usuário', id) : error;
    });
    return toUsuario(parseContract(usuarioDtoSchema, payload, RECURSO));
  }

  async findByEmail(email: string): Promise<readonly Usuario[]> {
    const payload = await this.http.get(RECURSO, { query: { email } });
    return parseContract(usuariosDtoSchema, payload, RECURSO).map(toUsuario);
  }

  async create(usuario: Usuario): Promise<Usuario> {
    const payload = await this.http.post(RECURSO, usuario);
    return toUsuario(parseContract(usuarioDtoSchema, payload, RECURSO));
  }

  async update(id: string, patch: UsuarioPatch): Promise<Usuario> {
    const payload = await this.http.patch(this.path(id), patch).catch((error: unknown) => {
      throw isNotFound(error) ? new NotFoundError('Usuário', id) : error;
    });
    return toUsuario(parseContract(usuarioDtoSchema, payload, RECURSO));
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(this.path(id)).catch((error: unknown) => {
      throw isNotFound(error) ? new NotFoundError('Usuário', id) : error;
    });
  }

  private path(id: string): string {
    return `${RECURSO}/${encodeURIComponent(id)}`;
  }
}
