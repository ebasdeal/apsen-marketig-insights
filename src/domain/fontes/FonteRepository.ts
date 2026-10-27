import type { Fonte, FonteConfig } from './Fonte';

export interface FontePageQuery {
  page: number;
  size: number;
}

export interface FontePage {
  items: readonly Fonte[];
  total: number;
}

export interface FonteRepository {
  listPage(query: FontePageQuery): Promise<FontePage>;
  listAll(): Promise<readonly Fonte[]>;
  existsNome(nome: string): Promise<boolean>;
  create(fonte: Fonte): Promise<Fonte>;
  update(id: string, patch: FonteConfig): Promise<Fonte>;
  delete(id: string): Promise<void>;
}
