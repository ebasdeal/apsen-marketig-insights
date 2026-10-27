import type { DeleteIngerido } from './DeleteIngerido';
import type { ListIngeridos } from './ListIngeridos';

export interface IngeridosUseCases {
  list: Pick<ListIngeridos, 'execute'>;
  remove: Pick<DeleteIngerido, 'execute'>;
}
