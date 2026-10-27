import type { CreateDriver } from './CreateDriver';
import type { DeleteDriver } from './DeleteDriver';
import type { GetDriverForForm } from './GetDriverForForm';
import type { GetDriverFormLookups } from './GetDriverFormLookups';
import type { GetDriversExport } from './GetDriversExport';
import type { ListDrivers } from './ListDrivers';
import type { SearchLaboratorios } from './SearchLaboratorios';
import type { SearchMarcas } from './SearchMarcas';
import type { UpdateDriver } from './UpdateDriver';

export interface DriversUseCases {
  formLookups: Pick<GetDriverFormLookups, 'execute'>;
  getForForm: Pick<GetDriverForForm, 'execute'>;
  create: Pick<CreateDriver, 'execute'>;
  update: Pick<UpdateDriver, 'execute'>;
  searchLaboratorios: Pick<SearchLaboratorios, 'execute'>;
  searchMarcas: Pick<SearchMarcas, 'execute'>;
  list: Pick<ListDrivers, 'execute'>;
  remove: Pick<DeleteDriver, 'execute'>;
  export: Pick<GetDriversExport, 'execute'>;
}
