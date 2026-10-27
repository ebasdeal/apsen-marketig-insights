import type { Page } from '../shared/Page';
import type { Familia, Franquia, Sku } from './Produto';

export interface CatalogQuery {
  busca: string;
  franquia: string;
  familia: string;
  page: number;
  size: number;
}

export interface ProductCatalogRepository {
  searchSkus(termo: string, limit: number): Promise<Sku[]>;
  findSku(produto: string, codigo: string): Promise<Sku | null>;
  searchFamilias(termo: string, limit: number): Promise<Familia[]>;
  getFamilia(id: string): Promise<Familia>;
  listFamiliasDaFranquia(franquia: string): Promise<Familia[]>;
  listFranquias(): Promise<Franquia[]>;
  listFamilias(query: CatalogQuery): Promise<Page<Familia>>;
}
