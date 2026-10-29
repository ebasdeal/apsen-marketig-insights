import type { CamposTipo, Categoria, DriverConfig, IntensidadeInfo, TipoStatus } from './lookups';

export interface DriverLookupRepository {
  listCategorias(): Promise<Categoria[]>;
  listTipos(): Promise<TipoStatus[]>;
  listCamposTipo(): Promise<CamposTipo[]>;
  listIntensidades(): Promise<IntensidadeInfo[]>;
  getFormConfig(): Promise<DriverConfig>;
  searchLaboratorios(termo: string, limit: number): Promise<string[]>;
  getMarcas(laboratorio: string): Promise<string[]>;
}
