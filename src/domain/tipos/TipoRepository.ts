import type { Page } from '../shared/Page';
import type {
  CamposTipo,
  Categoria,
  CategoriaTipoRef,
  Tipo,
  TipoPageRequest,
  TipoPatch,
} from './Tipo';

export interface TipoRepository {
  listPage(request: TipoPageRequest): Promise<Page<Tipo>>;
  count(filtro?: { ativo?: boolean }): Promise<number>;
  get(id: string): Promise<Tipo>;
  findBySlug(slug: string): Promise<Tipo | null>;
  create(tipo: Tipo): Promise<void>;
  update(id: string, patch: TipoPatch): Promise<void>;
  delete(id: string): Promise<void>;
  getCampos(id: string): Promise<CamposTipo | null>;
  saveCampos(campos: CamposTipo, existe: boolean): Promise<void>;
  deleteCampos(id: string): Promise<void>;
  listCategorias(): Promise<Categoria[]>;
  updateCategoriaTipos(id: number, tipos: CategoriaTipoRef[]): Promise<void>;
}
