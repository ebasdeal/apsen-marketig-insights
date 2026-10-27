import type { Fonte, FonteConfig } from '@domain/fontes/Fonte';
import type { FontePage, FontePageQuery, FonteRepository } from '@domain/fontes/FonteRepository';
import { slugFonte } from '@domain/fontes/fonteRules';

export class FakeFonteRepository implements FonteRepository {
  readonly calls: unknown[][] = [];
  fontes: Fonte[];

  constructor(fontes: readonly Fonte[] = []) {
    this.fontes = [...fontes];
  }

  async listPage(query: FontePageQuery): Promise<FontePage> {
    this.calls.push(['listPage', query]);
    const start = (query.page - 1) * query.size;
    return { items: this.fontes.slice(start, start + query.size), total: this.fontes.length };
  }

  async listAll(): Promise<readonly Fonte[]> {
    this.calls.push(['listAll']);
    return this.fontes;
  }

  async existsNome(nome: string): Promise<boolean> {
    this.calls.push(['existsNome', nome]);
    return this.fontes.some((fonte) => slugFonte(fonte.nome) === slugFonte(nome));
  }

  async create(fonte: Fonte): Promise<Fonte> {
    this.calls.push(['create', fonte]);
    this.fontes.push(fonte);
    return fonte;
  }

  async update(id: string, patch: FonteConfig): Promise<Fonte> {
    this.calls.push(['update', id, patch]);
    const fonte = { ...(this.fontes.find((item) => item.id === id) as Fonte), ...patch };
    return fonte;
  }

  async delete(id: string): Promise<void> {
    this.calls.push(['delete', id]);
    this.fontes = this.fontes.filter((fonte) => fonte.id !== id);
  }
}
