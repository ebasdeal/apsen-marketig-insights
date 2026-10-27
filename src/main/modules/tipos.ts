import { DeleteTipo } from '@application/tipos/DeleteTipo';
import { GetTipoForm } from '@application/tipos/GetTipoForm';
import { ImportCatalogo } from '@application/tipos/ImportCatalogo';
import { ListCategorias } from '@application/tipos/ListCategorias';
import { ListTipos } from '@application/tipos/ListTipos';
import { SaveTipo } from '@application/tipos/SaveTipo';
import type { TiposUseCases } from '@application/tipos/tiposUseCases';
import { ToggleTipoAtivo } from '@application/tipos/ToggleTipoAtivo';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { CryptoIdGenerator } from '@infrastructure/shared/CryptoIdGenerator';
import { HttpTipoRepository } from '@infrastructure/tipos/HttpTipoRepository';

export function createTiposModule(http: HttpClient): TiposUseCases {
  const repository = new HttpTipoRepository(http);
  const ids = new CryptoIdGenerator();
  return {
    list: new ListTipos(repository),
    categorias: new ListCategorias(repository),
    getForm: new GetTipoForm(repository),
    save: new SaveTipo(repository, ids),
    toggle: new ToggleTipoAtivo(repository),
    remove: new DeleteTipo(repository),
    importar: new ImportCatalogo(repository, ids),
  };
}
