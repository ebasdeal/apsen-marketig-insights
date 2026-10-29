import type { Permissao } from '@domain/permissoes/Permissao';
import type { PermissaoRepository } from '@domain/permissoes/PermissaoRepository';
import type { HttpClient } from '../http/HttpClient';
import { parseContract } from '../http/parseContract';
import { permissoesDtoSchema } from './permissaoSchema';

const RECURSO = '/permissoes';

export const PERMISSOES_LIMIT = 50;

export class HttpPermissaoRepository implements PermissaoRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<readonly Permissao[]> {
    const result = await this.http.getPage(RECURSO, {
      query: { _page: '1', _limit: String(PERMISSOES_LIMIT) },
    });
    return parseContract(permissoesDtoSchema, result.data, RECURSO).map((dto) => ({
      ...dto,
      id: String(dto.id),
    }));
  }
}
