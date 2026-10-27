import { ListPermissoes } from '@application/permissoes/ListPermissoes';
import type { PermissoesUseCases } from '@application/permissoes/permissoesUseCases';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { HttpPermissaoRepository } from '@infrastructure/permissoes/HttpPermissaoRepository';

export function createPermissoesModule(http: HttpClient): PermissoesUseCases {
  return { list: new ListPermissoes(new HttpPermissaoRepository(http)) };
}
