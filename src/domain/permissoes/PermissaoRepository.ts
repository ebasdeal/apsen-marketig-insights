import type { Permissao } from './Permissao';

export interface PermissaoRepository {
  list(): Promise<readonly Permissao[]>;
}
