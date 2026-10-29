import type { DeleteTipo } from './DeleteTipo';
import type { GetTipoForm } from './GetTipoForm';
import type { ImportCatalogo } from './ImportCatalogo';
import type { ListCategorias } from './ListCategorias';
import type { ListTipos } from './ListTipos';
import type { SaveTipo } from './SaveTipo';
import type { ToggleTipoAtivo } from './ToggleTipoAtivo';

export interface TiposUseCases {
  list: Pick<ListTipos, 'execute'>;
  categorias: Pick<ListCategorias, 'execute'>;
  getForm: Pick<GetTipoForm, 'execute'>;
  save: Pick<SaveTipo, 'execute'>;
  toggle: Pick<ToggleTipoAtivo, 'execute'>;
  remove: Pick<DeleteTipo, 'execute'>;
  importar: Pick<ImportCatalogo, 'execute'>;
}
