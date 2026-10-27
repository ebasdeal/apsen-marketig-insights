import type { Page } from '../shared/Page';
import type { Ingerido, IngeridoFiltro, IngeridoPageRequest } from './Ingerido';

export interface IngeridoRepository {
  listPage(filtro: IngeridoFiltro, request: IngeridoPageRequest): Promise<Page<Ingerido>>;
  delete(id: string): Promise<void>;
}
