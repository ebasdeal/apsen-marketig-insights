import type { ListPermissoes } from './ListPermissoes';

export interface PermissoesUseCases {
  list: Pick<ListPermissoes, 'execute'>;
}
