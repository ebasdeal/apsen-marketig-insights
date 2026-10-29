import type { Familia, Franquia, Sku } from '@domain/catalogo/Produto';
import type {
  CatalogQuery,
  ProductCatalogRepository,
} from '@domain/catalogo/ProductCatalogRepository';
import type { Page } from '@domain/shared/Page';
import { orFallbackOn404, orNotFound, parseResponse, resourcePath } from '../drivers/parseResponse';
import type { HttpClient } from '../http/HttpClient';
import { escapeRegex } from '../shared/escapeRegex';
import { familiaSchema, familiasSchema, franquiasSchema, skuSchema, skusSchema } from './schemas';

const ORDEM_ASC = 'asc,asc';

function opcional(valor: string): string | undefined {
  const texto = valor.trim();
  return texto === '' ? undefined : texto;
}

export class HttpProductCatalogRepository implements ProductCatalogRepository {
  constructor(private readonly http: HttpClient) {}

  async searchSkus(termo: string, limit: number): Promise<Sku[]> {
    const data = await this.http.get('/skus', {
      query: { q: opcional(termo), _sort: 'familia,id', _order: ORDEM_ASC, _limit: String(limit) },
    });
    return parseResponse(skusSchema, data, '/skus');
  }

  async findSku(produto: string, codigo: string): Promise<Sku | null> {
    if (produto.trim() !== '') {
      const path = resourcePath('skus', produto);
      const data = await orFallbackOn404(this.http.get(path), null);
      if (data !== null) {
        return parseResponse(skuSchema, data, path);
      }
    }
    if (codigo.trim() === '') {
      return null;
    }
    const data = await this.http.get('/skus', { query: { q: codigo.trim(), _limit: '1' } });
    return parseResponse(skusSchema, data, '/skus')[0] ?? null;
  }

  async searchFamilias(termo: string, limit: number): Promise<Familia[]> {
    const busca = opcional(termo);
    const data = await this.http.get('/familias', {
      query: {
        id_like: busca === undefined ? undefined : escapeRegex(busca),
        _sort: 'franquia,id',
        _order: ORDEM_ASC,
        _limit: String(limit),
      },
    });
    return parseResponse(familiasSchema, data, '/familias');
  }

  async getFamilia(id: string): Promise<Familia> {
    const path = resourcePath('familias', id);
    const data = await orNotFound(this.http.get(path), 'Família', id);
    return parseResponse(familiaSchema, data, path);
  }

  async listFamiliasDaFranquia(franquia: string): Promise<Familia[]> {
    const data = await this.http.get('/familias', { query: { franquia } });
    return parseResponse(familiasSchema, data, '/familias');
  }

  async listFranquias(): Promise<Franquia[]> {
    return parseResponse(franquiasSchema, await this.http.get('/franquias'), '/franquias');
  }

  async listFamilias(query: CatalogQuery): Promise<Page<Familia>> {
    const { data, total } = await this.http.getPage('/familias', {
      query: {
        _page: String(query.page),
        _limit: String(query.size),
        _sort: 'franquia,id',
        _order: ORDEM_ASC,
        q: opcional(query.busca),
        franquia: opcional(query.franquia),
        id: opcional(query.familia),
      },
    });
    return {
      items: parseResponse(familiasSchema, data, '/familias'),
      total,
      page: query.page,
      limit: query.size,
    };
  }
}
